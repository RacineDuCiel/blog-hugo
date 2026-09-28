#!/usr/bin/env python3
"""Integration checks for YAML collections and legacy shortcodes in isolated content."""
import json
import shutil
import struct
import subprocess
import tempfile
import zlib
from html.parser import HTMLParser
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
BUNDLE = Path('posts/musique/recommandations-musique')

class AlbumHTML(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.images = []; self.titles = []; self.artists = []; self.field = None
        self.in_info = False; self.lists = 0; self.items = 0
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'img' and a.get('class') == 'album-cover-img': self.images.append(a)
        if tag == 'ul' and a.get('role') == 'list': self.lists += 1
        if tag == 'li' and a.get('class') == 'album-card': self.items += 1
        if tag == 'div' and a.get('class') == 'album-info': self.in_info = True
        if self.in_info and tag in ('h3', 'p'):
            self.field = self.titles if tag == 'h3' else self.artists
            self.field.append('')
    def handle_data(self, data):
        if self.field is not None: self.field[-1] += data
    def handle_endtag(self, tag):
        if tag in ('h3', 'p'): self.field = None
        if tag == 'div': self.in_info = False

def png(width, height):
    def chunk(kind, data):
        return struct.pack('!I',len(data)) + kind + data + struct.pack('!I',zlib.crc32(kind+data))
    pixels = (b'\0' + b'\x70\x80\x90' * width) * height
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR',struct.pack('!2I5B',width,height,8,2,0,0,0)) + chunk(b'IDAT',zlib.compress(pixels)) + chunk(b'IEND',b'')

with tempfile.TemporaryDirectory(prefix='racineduciel-albums-') as directory:
    work = Path(directory); content = work/'content'
    shutil.copytree(REPO/'content', content)
    bundle = content/BUNDLE; md = bundle/'index.md'; data = bundle/'albums.yaml'
    original = md.read_text(); original_data = data.read_text()
    expected_count = sum(line.lstrip().startswith("- artist:") for line in original_data.splitlines())
    config = work/'fixture.toml'
    config.write_text('[Languages.fr-fr]\ncontentDir = '+json.dumps(str(content))+'\n')
    destination = work/'public'
    def build(expected_error=None):
        result = subprocess.run(['hugo','--noBuildLock','--config',str(REPO/'hugo.toml')+','+str(config),'--destination',str(destination)],cwd=REPO,capture_output=True,text=True)
        if expected_error:
            assert result.returncode != 0 and expected_error in result.stdout+result.stderr, result.stdout+result.stderr
            return
        assert result.returncode == 0, result.stdout+result.stderr
        source = (destination/BUNDLE/'index.html').read_text()
        return source, AlbumHTML(source)
    source, page = build()
    assert len(page.images) == page.items == expected_count and page.lists == 2
    assert [i['loading'] for i in page.images] == ['eager']*2 + ['lazy']*(expected_count-2)
    assert 'id="classiques"' in source and 'id="hautement-recommandés"' in source
    search = next(x for x in json.loads((destination/'index.json').read_text()) if x['title']=='Recommandations musicales')
    for text in page.titles + page.artists: assert text in search['contents'], text
    assert '/sass/media.' not in source
    print('PASS: collections, album count, accessible lists, eager/lazy, anchors and search')

    (bundle/'small.png').write_bytes(png(160,80))
    long_title = 'Un titre long : ' + 'la musique et ses silences ' * 8
    data.write_text(json.dumps({'classiques':[{'artist':'Artiste & invité','title':long_title,'cover':'small.png'}], 'recommandes':[]}))
    _, page = build(); image = page.images[0]
    assert (image['width'],image['height']) == ('160','80')
    assert len(image['srcset'].split(',')) == 1 and image['srcset'].endswith(' 160w')
    assert page.titles == [long_title] and page.artists == ['Artiste & invité']
    print('PASS: small rectangular source, no upscale, no duplicate width, long title')

    for fields,error in [({'artist':'A','cover':'small.png'},"champ obligatoire 'title'"),({'artist':'A','title':'T','cover':'missing.jpg'},'pochette introuvable')]:
        data.write_text(json.dumps({'classiques':[fields],'recommandes':[]})); build(error)
    data.write_text(original_data); md.write_text(original.replace('albums "classiques"','albums "inconnue"')); build('collection inconnue')
    print('PASS: explicit missing field, missing image and unknown collection errors')

    frontmatter = original.split('---',2)[1]
    legacy = '\n{{< grid variant="classics" >}}\n{{< album artist="Architects" title="Holy Hell" cover="architects-holy-hell.jpg" >}}\n{{< /grid >}}\n'
    md.write_text('---'+frontmatter+'---'+legacy)
    _, page = build(); assert page.items == 1 and page.titles == ['Holy Hell']
    md.write_text('---'+frontmatter.replace('pageClass: "music-recs"','')+'---'+legacy)
    _, page = build(); assert page.items == 0 and page.titles == ['Architects'] and page.artists == ['Holy Hell']
    print('PASS: historical album/grid interfaces, music and generic contexts')

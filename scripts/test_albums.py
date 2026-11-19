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
        if tag == 'li' and a.get('class') in ('album-card', 'music-record'): self.items += 1
        if tag == 'div' and a.get('class') == 'album-info': self.in_info = True
        if self.in_info and tag in ('h3', 'p'):
            self.field = self.titles if tag == 'h3' else self.artists
            self.field.append('')
        if tag == 'p' and a.get('class') in ('music-record-title', 'music-record-artist'):
            self.field = self.titles if a['class'] == 'music-record-title' else self.artists
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
    original = md.read_text()
    (bundle/'fixture-cover.png').write_bytes(png(320, 320))
    recommendations = [
        {'id': f'disque-{index}', 'artist': f'Artiste de test {index}',
         'title': f'Disque de test {index}', 'cover': 'fixture-cover.png'}
        for index in range(1, 4)
    ]
    expected_count = len(recommendations)
    data.write_text(json.dumps({'recommandes': recommendations, 'ecoutes': []}))
    config = work/'fixture.toml'
    config.write_text('[Languages.fr-fr]\ncontentDir = '+json.dumps(str(content))+'\n')
    destination = work/'public'
    archive = destination/'posts/index.html'
    def build(expected_error=None):
        result = subprocess.run(['hugo','--noBuildLock','--config',str(REPO/'hugo.toml')+','+str(config),'--destination',str(destination)],cwd=REPO,capture_output=True,text=True)
        if expected_error:
            assert result.returncode != 0 and expected_error in result.stdout+result.stderr, result.stdout+result.stderr
            return
        assert result.returncode == 0, result.stdout+result.stderr
        source = (destination/BUNDLE/'index.html').read_text()
        return source, AlbumHTML(source)
    source, page = build()
    assert len(page.images) == page.items == expected_count and page.lists == 1
    collection = source.split('<aside class="music-collection article-index-group"', 1)[1].split('</aside>', 1)[0]
    assert '<details' not in collection and '<summary' not in collection
    assert '>Recommandations</span></h2>' in source
    label = f'{expected_count} disque' + ('s' if expected_count != 1 else '')
    assert f'<span>{label}</span>' in archive.read_text()
    assert [i['loading'] for i in page.images] == ['eager', 'lazy', 'lazy']
    for image in page.images:
        assert image['sizes'] == '44px'
        assert all(int(source.rsplit(' ', 1)[-1][:-1]) <= 144 for source in image['srcset'].split(', '))
    assert 'id="classiques"' in source and 'id="hautement-recommandés"' in source
    search = next(x for x in json.loads((destination/'index.json').read_text()) if x['permalink'] == f'/{BUNDLE.as_posix()}/')
    assert search['title'] == 'Musique'
    for text in page.titles + page.artists: assert text in search['contents'], text
    assert '/sass/media.' not in source
    assert 'Aucune écoute publiée pour le moment.' in source
    print('PASS: collections, empty journal, album count, thumbnails, anchors and search')

    (bundle/'small.png').write_bytes(png(32,16))
    long_title = 'Un titre long : ' + 'la musique et ses silences ' * 8
    data.write_text(json.dumps({'classiques':[{'artist':'Artiste & invité','title':long_title,'cover':'small.png'}], 'recommandes':[]}))
    _, page = build(); image = page.images[0]
    assert '<span>1 disque</span>' in archive.read_text()
    assert (image['width'],image['height']) == ('32','16')
    assert len(image['srcset'].split(',')) == 1 and image['srcset'].endswith(' 32w')
    assert page.titles == [long_title] and page.artists == ['Artiste & invité']
    print('PASS: small rectangular source, no upscale, no duplicate width, long title')

    def write_listens(entries):
        data.write_text(json.dumps({'recommandes': recommendations, 'ecoutes': entries}))

    write_listens([
        {'album': 'disque-2'},
        {'id': 'test-sans-pochette', 'artist': 'Artiste de test', 'title': 'Album sans pochette'},
        {'album': 'disque-1'},
        {'artist': 'Groupe de test', 'title': 'Album recommandé depuis le fil', 'collection': 'recommandes'},
        {'album': 'disque-3'},
        {'album': 'test-sans-pochette', 'note': 'Nouvelle écoute <exemple>.'},
        {'album': 'disque-1', 'note': 'Retour à cet album.'},
    ])
    source, _ = build()
    collection, journal = source.split('<section class="music-journal article-index-group"', 1)
    current, earlier = journal.split('<details class="music-journal-more">', 1)
    assert AlbumHTML(current).titles == [
        'Disque de test 1', 'Album sans pochette', 'Disque de test 3',
        'Album recommandé depuis le fil', 'Disque de test 1',
    ]
    assert AlbumHTML(earlier).titles == ['Album sans pochette', 'Disque de test 2']
    assert 'Album recommandé depuis le fil' in AlbumHTML(collection).titles
    assert 'Retour à cet album.' in journal and '&lt;exemple&gt;' in journal
    assert '<time' not in journal and 'music-cover-placeholder' in journal
    assert f'<span>{expected_count + 2} disques</span>' in archive.read_text()
    search = next(x for x in json.loads((destination/'index.json').read_text()) if x['title'] == 'Musique')
    assert 'Album sans pochette' in search['contents'] and 'Retour à cet album.' in search['contents']
    print('PASS: addition order, older listens, rediscoveries, promotion, notes, no dates and search')

    write_listens([{'album': 'disque-inconnu'}])
    build("aucun disque défini avant l’écoute")
    write_listens([{'id': 'disque-1', 'artist': 'A', 'title': 'B'}])
    build("identifiant de disque 'disque-1' utilisé plusieurs fois")
    print('PASS: explicit errors for unknown references and duplicate album IDs')

    for fields,error in [({'artist':'A','cover':'small.png'},"champ obligatoire 'title'"),({'artist':'A','title':'T','cover':'missing.jpg'},'pochette introuvable')]:
        data.write_text(json.dumps({'classiques':[fields],'recommandes':[]})); build(error)
    frontmatter = original.split('---',2)[1].replace('layout: "musique"\n', '')
    write_listens([])
    md.write_text('---' + frontmatter + '---\n{{< albums "inconnue" >}}\n')
    build('collection inconnue')
    print('PASS: explicit missing field, missing image and unknown collection errors')

    legacy = '\n{{< grid variant="classics" >}}\n{{< album artist="Artiste de test 1" title="Disque de test 1" cover="fixture-cover.png" >}}\n{{< /grid >}}\n'
    md.write_text('---'+frontmatter+'---'+legacy)
    _, page = build(); assert page.items == 1 and page.titles == ['Disque de test 1']
    md.write_text('---'+frontmatter.replace('pageClass: "music-recs"','')+'---'+legacy)
    _, page = build(); assert page.items == 0 and page.titles == ['Artiste de test 1'] and page.artists == ['Disque de test 1']
    print('PASS: historical album/grid interfaces, music and generic contexts')

#!/usr/bin/env python3
"""Validate Hugo output without external dependencies.
Usage: python3 scripts/verify.py public [--baseline /path/to/previous/build]
"""
import argparse
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
import xml.etree.ElementTree as ET

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = []; self.refs = []; self.h1 = 0; self.main = 0
        self.redirect = False; self.canonical = ''; self.description = None
        self.json_data = []; self.in_json = False; self.json_buffer = ''
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        self.h1 += tag == 'h1'; self.main += tag == 'main'
        if tag == 'meta' and a.get('http-equiv','').lower() == 'refresh': self.redirect = True
        if tag == 'meta' and a.get('name') == 'description': self.description = a.get('content')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href','')
        if tag in ('a','link') and a.get('href'): self.refs.append(a['href'])
        if tag in ('img','script','source','iframe') and a.get('src'): self.refs.append(a['src'])
        if a.get('srcset'):
            self.refs.extend(v.strip().split()[0] for v in a['srcset'].split(','))
        if tag == 'script' and a.get('type') == 'application/ld+json': self.in_json = True; self.json_buffer = ''
    def handle_data(self, text):
        if self.in_json: self.json_buffer += text
    def handle_endtag(self, tag):
        if tag == 'script' and self.in_json:
            self.json_data.append(json.loads(self.json_buffer)); self.in_json = False

def verify(root, baseline=None):
    errors = []; pages = {}; references = 0
    for path in root.rglob('*.html'):
        try: pages[path.relative_to(root).as_posix()] = Page(path.read_text())
        except Exception as e: errors.append(f'{path}: {e}')
    hosts = {urlparse(p.canonical).netloc for p in pages.values() if p.canonical}
    hosts |= {'racineduciel.fr','localhost:1313','127.0.0.1:1313'}
    for name,page in pages.items():
        if page.redirect: continue
        if page.main != 1: errors.append(f'{name}: {page.main} main elements')
        if page.h1 != 1: errors.append(f'{name}: {page.h1} H1 elements')
        if not page.description: errors.append(f'{name}: empty description')
        for id,n in Counter(page.ids).items():
            if n > 1: errors.append(f'{name}: duplicate id {id}')
        for ref in page.refs:
            target = urlparse(urljoin('/'+name,ref))
            if target.scheme and target.scheme not in ('http','https'): continue
            if target.netloc and target.netloc not in hosts: continue
            path = unquote(target.path).lstrip('/')
            dest = root/path
            if dest.is_dir(): path = path.rstrip('/')+'/index.html' if path else 'index.html'; dest = root/path
            references += 1
            if not dest.is_file(): errors.append(f'{name}: missing target {ref}'); continue
            if target.fragment and path in pages and unquote(target.fragment) not in pages[path].ids:
                errors.append(f'{name}: missing anchor {ref}')
    if baseline:
        old = {p.relative_to(baseline) for p in baseline.rglob('*.html')}
        missing = sorted(str(p) for p in old if not (root/p).is_file())
        errors.extend(f'Lost URL: {p}' for p in missing)
    index = json.loads((root/'index.json').read_text())
    articles = {unquote(urlparse(page.canonical).path) for page in pages.values()
                if any(d.get('@type') == 'BlogPosting' for d in page.json_data)}
    searchable = [unquote(urlparse(item['permalink']).path) for item in index]
    if len(searchable) != len(set(searchable)): errors.append('Duplicate articles in search')
    if not set(searchable).issubset(articles): errors.append('Search refers to missing article pages')
    if any('/fragments/' in item['permalink'] or '/search/' in item['permalink'] for item in index): errors.append('Non-article leaked into search')
    for name in ('sitemap.xml','index.xml'):
        xml = (root/name).read_text(); ET.fromstring(xml)
        if '/fragments/' in xml: errors.append(f'Fragment leaked into {name}')
    if (root/'fragments/index.html').exists(): errors.append('Fragment section was published')
    if errors:
        for error in errors: print('FAIL',error)
        raise SystemExit(1)
    print(f'PASS: {len(pages)} HTML files, {references} local references, {len(index)} searchable articles, RSS and sitemap, no fragment pages.')

if __name__ == '__main__':
    p=argparse.ArgumentParser();p.add_argument('directory',type=Path);p.add_argument('--baseline',type=Path)
    a=p.parse_args();verify(a.directory,a.baseline)

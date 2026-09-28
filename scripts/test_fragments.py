#!/usr/bin/env python3
"""Build isolated content fixtures; never edit the site's real content."""
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]

with tempfile.TemporaryDirectory(prefix='racineduciel-fragments-') as directory:
    work = Path(directory)
    content = work / 'content'
    shutil.copytree(REPO / 'content', content)
    opening = content / 'fragments/ouverture/index.md'
    interlude = content / 'fragments/interlude/index.md'
    config = work / 'fixture.toml'
    config.write_text('[Languages.fr-fr]\ncontentDir = ' + json.dumps(str(content)) + '\n')
    original = opening.read_text()
    disabled = '---\nheadless: true\nenabled: false\n---\n'
    interlude.write_text(disabled)
    cases = [
        ('disabled', disabled + 'Invisible', 0, None),
        ('empty', '---\nheadless: true\nenabled: true\n---\n', 0, None),
        ('text', '---\nheadless: true\nenabled: true\n---\nFragment de contrôle.', 1, 'Fragment de contrôle.'),
        ('image', '---\nheadless: true\nenabled: true\nimage: portrait.jpg\nalt: Portrait de contrôle\n---\n', 1, 'Portrait de contrôle'),
        ('markdown-image', '---\nheadless: true\nenabled: true\n---\n![Image de contrôle](portrait.jpg)', 1, 'Image de contrôle'),
        ('caption-link', '---\nheadless: true\nenabled: true\ncaption: Légende de contrôle\nlink: /posts/\nlinkLabel: Explorer\n---\nFragment de contrôle.', 1, 'Explorer'),
        ('both-slots', original, 2, 'Second fragment de contrôle.'),
    ]
    for name, markdown, expected, text in cases:
        opening.write_text(markdown)
        if name == 'both-slots':
            interlude.write_text('---\nheadless: true\nenabled: true\n---\nSecond fragment de contrôle.')
        destination = work / name
        subprocess.run(['hugo', '--config', str(REPO/'hugo.toml') + ',' + str(config), '--destination', str(destination), '--noBuildLock'], cwd=REPO, check=True, capture_output=True)
        home = (destination / 'index.html').read_text()
        assert home.count('aria-label="Fragment personnel"') == expected, name
        assert text is None or text in home, name
        assert not list((destination / 'fragments').glob('**/*.html')), name
        for index in ('index.json', 'index.xml', 'sitemap.xml'):
            assert '/fragments/' not in (destination / index).read_text(), (name, index)
        print('PASS:', name)
    shutil.rmtree(content / 'fragments')
    destination = work / 'absent'
    subprocess.run(['hugo', '--config', str(REPO/'hugo.toml') + ',' + str(config), '--destination', str(destination), '--noBuildLock'], cwd=REPO, check=True, capture_output=True)
    assert 'aria-label="Fragment personnel"' not in (destination/'index.html').read_text()
    print('PASS: absent')

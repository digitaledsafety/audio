import os
import glob
import json
import re

def build():
    os.makedirs('_site', exist_ok=True)

    # 1. Build index.html from _layouts/default.html
    with open('_layouts/default.html', 'r', encoding='utf-8') as f:
        template = f.read()

    template = re.sub(r'\{%\s*if[^\n]*%\}', '', template)
    template = re.sub(r'\{%\s*endif\s*%\}', '', template)

    html = template.replace('{{ "assets/js/mini-notation-parser.js" | relative_url }}', 'assets/js/mini-notation-parser.js')
    html = html.replace('{{ "assets/js/multiplayer-session.js" | relative_url }}', 'assets/js/multiplayer-session.js')
    html = html.replace('{{ "/watch.html" | relative_url }}', 'watch.html')
    html = html.replace('{{ "/" | relative_url }}', 'index.html')
    html = html.replace('{{ "/showcase.html" | relative_url }}', 'showcase.html')
    html = html.replace('{{ "/manifest.json" | relative_url }}', 'manifest.json')
    html = html.replace('{{ "/sw.js" | relative_url }}', 'sw.js')

    html = html.replace('{{ "assets/js/audio-worklets/bitcrusher-processor.js" | relative_url }}', 'assets/js/audio-worklets/bitcrusher-processor.js')
    html = html.replace('{{ "assets/js/audio-worklets/granular-processor.js" | relative_url }}', 'assets/js/audio-worklets/granular-processor.js')
    html = html.replace('{{ "assets/js/audio-worklets/vocoder-processor.js" | relative_url }}', 'assets/js/audio-worklets/vocoder-processor.js')
    html = html.replace('{{ "assets/js/audio-worklets/quantizer-processor.js" | relative_url }}', 'assets/js/audio-worklets/quantizer-processor.js')

    with open('_site/index.html', 'w', encoding='utf-8') as f:
        f.write(html)

    # 2. Build watch.html
    with open('watch.html', 'r', encoding='utf-8') as f:
        watch_html = f.read()

    watch_html = watch_html.replace('{{ "assets/js/multiplayer-session.js" | relative_url }}', 'assets/js/multiplayer-session.js')
    watch_html = watch_html.replace('{{ "/" | relative_url }}', 'index.html')
    watch_html = watch_html.replace('{{ "/showcase.html" | relative_url }}', 'showcase.html')
    watch_html = watch_html.replace('{{ "/?host=true" | relative_url }}', 'index.html?host=true')

    with open('_site/watch.html', 'w', encoding='utf-8') as f:
        f.write(watch_html)

    # 3. Build showcase.html
    presets = []
    for filepath in sorted(glob.glob('_workspaces/*.md')):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        title_match = re.search(r'title:\s*(.*)', content)
        ws_match = re.search(r'workspace_data:\s*(.*)', content)

        title = title_match.group(1).strip() if title_match else os.path.basename(filepath).replace('.md', '')
        ws_data = ws_match.group(1).strip() if ws_match else ''

        url = f'index.html?workspace={os.path.basename(filepath).replace(".md", "")}'
        presets.append({'title': title, 'url': url, 'workspace_data': ws_data})

    with open('showcase.html', 'r', encoding='utf-8') as f:
        showcase_html = f.read()

    raw_presets_js = "const RAW_PRESETS = " + json.dumps(presets) + ";"
    showcase_html = re.sub(r'const RAW_PRESETS = \[[\s\S]*?\];', raw_presets_js, showcase_html)

    showcase_html = showcase_html.replace('{{ "/" | relative_url }}', 'index.html')
    showcase_html = showcase_html.replace('{{ "/watch.html" | relative_url }}', 'watch.html')

    with open('_site/showcase.html', 'w', encoding='utf-8') as f:
        f.write(showcase_html)

    # 4. Copy assets & root files
    os.system('cp -r assets _site/')
    if os.path.exists('sw.js'):
        with open('sw.js', 'r', encoding='utf-8') as f:
            sw_content = f.read()
        sw_content = re.sub(r'^---\nlayout:\s*none\n---\n?', '', sw_content)
        sw_content = sw_content.replace('{{ site.baseurl }}', '')
        with open('_site/sw.js', 'w', encoding='utf-8') as f:
            f.write(sw_content)
    if os.path.exists('manifest.json'):
        os.system('cp manifest.json _site/')

if __name__ == '__main__':
    build()

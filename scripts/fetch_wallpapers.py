#!/usr/bin/env python3
"""从 Bing API 采集壁纸数据，生成 wallpapers.json"""
import json
import urllib.request
import os
import sys

BING_URL = 'https://cn.bing.com/HPImageArchive.aspx?format=js&n=8&idx={}'
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
OUTPUT_FILE = os.path.join(DATA_DIR, 'wallpapers.json')
MAX_WALLPAPERS = 200

def fetch(idx):
    url = BING_URL.format(idx)
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
    return data.get('images', [])

def main():
    os.makedirs(DATA_DIR, exist_ok=True)

    # 加载已有数据
    existing = []
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            existing = json.load(f)

    existing_ids = {w['urlbase'] for w in existing}

    # 采集过去 8 天的壁纸
    all_images = list(existing)
    for idx in range(8):
        try:
            images = fetch(idx)
            for img in images:
                if img['urlbase'] not in existing_ids:
                    all_images.append(img)
                    existing_ids.add(img['urlbase'])
            print(f'idx={idx}: 获取 {len(images)} 张，新增 {sum(1 for i in images if i["urlbase"] not in existing_ids)} 张')
        except Exception as e:
            print(f'idx={idx}: 失败 - {e}', file=sys.stderr)

    # 去重，限制数量
    seen = set()
    unique = []
    for w in all_images:
        if w['urlbase'] not in seen:
            seen.add(w['urlbase'])
            unique.append(w)
    unique = unique[-MAX_WALLPAPERS:]  # 保留最新的

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique, f, ensure_ascii=False, indent=2)

    print(f'\n总计: {len(unique)} 张壁纸 → {OUTPUT_FILE}')

if __name__ == '__main__':
    main()

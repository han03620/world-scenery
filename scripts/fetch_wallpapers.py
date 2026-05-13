#!/usr/bin/env python3
"""从 Bing API 深度采集壁纸（60+国家 × 8天）"""
import json
import urllib.request
import os
import sys

BING_URL = 'https://www.bing.com/HPImageArchive.aspx?format=js&n=8&cc={cc}&idx={idx}'
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
OUTPUT_FILE = os.path.join(DATA_DIR, 'wallpapers.json')
MAX_WALLPAPERS = 600

# 全球 65 个国家/地区代码——不同地区收到不同壁纸
COUNTRIES = [
    'cn', 'us', 'jp', 'de', 'fr', 'gb', 'au', 'it', 'es', 'in', 'br', 'kr',
    'ca', 'mx', 'ar', 'at', 'be', 'bg', 'ch', 'cl', 'co', 'cr', 'cz',
    'dk', 'ec', 'ee', 'eg', 'fi', 'gr', 'hk', 'hr', 'hu', 'id', 'ie',
    'il', 'is', 'lt', 'lu', 'lv', 'my', 'nl', 'no', 'nz', 'pe', 'ph',
    'pl', 'pt', 'ro', 'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th',
    'tr', 'tw', 'ua', 'vn', 'za', 'ae', 'ma', 'ke', 'np',
]

def fetch(cc, idx):
    url = BING_URL.format(cc=cc, idx=idx)
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
    return data.get('images', [])

def main():
    os.makedirs(DATA_DIR, exist_ok=True)

    existing = []
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            existing = json.load(f)

    existing_ids = {w['urlbase'] for w in existing}
    all_images = list(existing)
    added = 0

    # 过去 8 天 × 65 个国家
    total = len(COUNTRIES) * 8
    done = 0
    for idx in range(8):
        for cc in COUNTRIES:
            done += 1
            try:
                images = fetch(cc, idx)
                new = sum(1 for img in images if img['urlbase'] not in existing_ids)
                for img in images:
                    if img['urlbase'] not in existing_ids:
                        all_images.append(img)
                        existing_ids.add(img['urlbase'])
                added += new
                if new > 0:
                    print(f'[{done}/{total}] idx={idx} cc={cc}: +{new}')
            except Exception as e:
                print(f'[{done}/{total}] idx={idx} cc={cc}: 失败', file=sys.stderr)

    # 去重
    seen = set()
    unique = []
    for w in all_images:
        if w['urlbase'] not in seen:
            seen.add(w['urlbase'])
            unique.append(w)
    unique = unique[-MAX_WALLPAPERS:]

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique, f, ensure_ascii=False, indent=2)

    print(f'\n总计: {len(unique)} 张壁纸（新增 {added} 张）→ {OUTPUT_FILE}')

if __name__ == '__main__':
    main()

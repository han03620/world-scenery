#!/usr/bin/env python3
"""从 Bing API 多地区采集壁纸数据，生成 wallpapers.json"""
import json
import urllib.request
import os
import sys

BING_URL = 'https://www.bing.com/HPImageArchive.aspx?format=js&n=8&mkt={mkt}&idx={idx}'
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
OUTPUT_FILE = os.path.join(DATA_DIR, 'wallpapers.json')
MAX_WALLPAPERS = 300

# 不同地区每天推送不同的壁纸，多地区采集大幅增加图库
MARKETS = [
    'zh-CN',   # 中国
    'en-US',   # 美国
    'ja-JP',   # 日本
    'de-DE',   # 德国
    'fr-FR',   # 法国
    'en-GB',   # 英国
    'en-AU',   # 澳大利亚
    'it-IT',   # 意大利
    'es-ES',   # 西班牙
    'en-IN',   # 印度
    'pt-BR',   # 巴西
    'ko-KR',   # 韩国
]

def fetch(mkt, idx):
    url = BING_URL.format(mkt=mkt, idx=idx)
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
    all_images = list(existing)
    added = 0

    # 过去 8 天 × 12 个地区
    for idx in range(8):
        for mkt in MARKETS:
            try:
                images = fetch(mkt, idx)
                new = 0
                for img in images:
                    if img['urlbase'] not in existing_ids:
                        all_images.append(img)
                        existing_ids.add(img['urlbase'])
                        new += 1
                added += new
                if new > 0:
                    print(f'idx={idx} mkt={mkt}: +{new} 张')
            except Exception as e:
                print(f'idx={idx} mkt={mkt}: 失败 - {e}', file=sys.stderr)

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

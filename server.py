#!/usr/bin/env python3
"""世界风景网站 — 本地服务器（含 Bing API 代理，解决 CORS 跨域问题）"""
import http.server
import urllib.request
import json
import os
import sys

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/bing'):
            self._proxy_bing()
        else:
            super().do_GET()

    def _proxy_bing(self):
        # 解析 idx 参数
        query = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = {}
        for p in query.split('&'):
            if '=' in p:
                k, v = p.split('=', 1)
                params[k] = v
        idx = params.get('idx', '0')

        url = f'https://cn.bing.com/HPImageArchive.aspx?format=js&n=8&idx={idx}'
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def log_message(self, format, *args):
        # 简洁日志
        if '/api/bing' in str(args[0]):
            print(f'[Bing API] idx={args[0].split("idx=")[-1][:2] if "idx=" in str(args[0]) else "?"}')
        else:
            super().log_message(format, *args)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'服务已启动: http://localhost:{PORT}')
    print('按 Ctrl+C 停止')
    sys.stdout.flush()
    http.server.HTTPServer(('0.0.0.0', PORT), Handler).serve_forever()

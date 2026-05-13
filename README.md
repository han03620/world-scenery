# 世界风景随机展示网站

每次刷新随机展示一张世界美景照片，**国内可直接访问，无需 VPN**。

## 工作原理

- 壁纸数据预存在 `data/wallpapers.json`（本地同源加载，无 CORS 问题）
- 图片来源：Bing 每日壁纸（cn.bing.com，国内可访问）
- GitHub Actions 每天自动采集新壁纸并更新数据文件

## 本地预览

```bash
# 方式一：Python
python server.py

# 方式二：任意 HTTP 服务器
python -m http.server 8080
# 或
npx http-server
```

浏览器打开 http://localhost:8080

## 部署到 GitHub Pages（生成可分享链接）

### 1. 创建 GitHub 仓库

在 GitHub 新建仓库，例如 `world-scenery`

### 2. 推送代码

```bash
cd world-scenery
git init
git add .
git commit -m "世界风景随机展示网站"
git branch -M main
git remote add origin https://github.com/你的用户名/world-scenery.git
git push -u origin main
```

### 3. 开启 GitHub Pages

仓库页面 → **Settings** → **Pages** →
- Source: `Deploy from a branch`
- Branch: `main`，目录 `/ (root)`
- 点击 **Save**

几分钟后即可通过 `https://你的用户名.github.io/world-scenery/` 访问！

### 4. 自动更新壁纸

推送后 GitHub Actions 会每天自动运行 `scripts/fetch_wallpapers.py` 采集新的 Bing 壁纸，保持图片库持续更新。也可在仓库的 **Actions** 页面手动触发。

## 功能

- 刷新/点击"换一张" → 随机展示世界风景
- 显示拍摄地点和摄影师信息（英文 + 中文翻译）
- 空格键 / 右箭头键 快速切换
- 不会连续出现相同图片
- 壁纸覆盖全球美景：山脉、海洋、森林、瀑布、沙漠等

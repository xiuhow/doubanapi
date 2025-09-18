# 🎬 豆瓣电影数据API

基于Express的豆瓣电影、电视剧、综艺、动画数据API服务，支持多平台部署。

## 📦 项目结构

```
doubanapi/
├── api-server.js          # 主API服务器
├── config.js              # 配置文件
├── hot.js                 # 豆瓣爬虫核心
├── vercel.json            # Vercel部署配置
├── netlify.toml           # Netlify部署配置
├── wrangler.toml          # Cloudflare部署配置
├── deploy.sh              # 一键部署脚本
├── .env.example           # 环境变量示例
├── example.js             # 使用示例
├── test_spider.js         # 测试脚本
├── doubanapi.md           # 详细API文档
├── netlify/
│   └── functions/
│       └── api.js         # Netlify函数处理
└── _functions/
    └── api/
        └── [[path]].js    # Cloudflare函数处理
```

## 🚀 快速开始

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
node api-server.js

# 测试API
node test_spider.js
```

### 一键部署
```bash
# 赋予执行权限
chmod +x deploy.sh

# 部署到Vercel（推荐）
./deploy.sh vercel

# 部署到Netlify
./deploy.sh netlify

# 部署到Cloudflare
./deploy.sh cloudflare
```

## 🌐 部署平台

### Vercel（推荐）
- 自动CI/CD
- Serverless函数
- 全球CDN加速
- 配置简单

### Netlify
- 静态站点+函数
- 免费额度充足
- GitHub集成

### Cloudflare Pages
- 边缘计算
- 高性能
- 免费套餐

## 📖 API文档

详细API接口说明请查看 [doubanapi.md](./doubanapi.md)

## 🔧 配置说明

### 环境变量
复制 `.env.example` 为 `.env` 并配置：

```env
PORT=3001
REQUEST_TIMEOUT=10000
REQUEST_RETRIES=3
```

### 平台特定配置
- **Vercel**: 在控制台设置环境变量
- **Netlify**: 在控制台设置环境变量
- **Cloudflare**: 修改 `wrangler.toml`

## 📊 功能特性

- ✅ 电影数据（热映、口碑榜、TOP250等）
- ✅ 电视剧数据（热门、TOP250）
- ✅ 综艺数据
- ✅ 动画数据
- ✅ 搜索功能
- ✅ 统计信息
- ✅ 30分钟缓存
- ✅ 跨域支持
- ✅ 错误处理

## 🛠 技术栈

- **Node.js** + **Express**
- **Axios** - HTTP请求
- **Cheerio** - HTML解析
- **CORS** - 跨域支持

## 📝 注意事项

1. 数据来自豆瓣公开页面，请合理使用
2. 建议配置请求频率限制
3. 生产环境建议开启安全中间件
4. 豆瓣可能会限制访问频率

---
*更多详细信息请查看 [完整API文档](./doubanapi.md)*
# 豆瓣电影数据API对接文档

## 📋 概述
豆瓣电影数据API提供电影、电视剧、综艺、动画等多种内容类型的热门榜单数据，基于Express框架构建，支持JSON格式返回。

## 🚀 基础信息

**基础URL**: `http://localhost:3001`
**端口**: 3001 (可配置环境变量 `PORT`)
**数据格式**: JSON
**缓存策略**: 30分钟内存缓存

## 🔑 接口列表

### 1. 健康检查
检查API服务状态

**端点**: `GET /health`

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2025-09-18T13:12:32.124Z"
}
```

### 2. 获取所有数据
获取完整的各类别数据

**端点**: `GET /api/all`

**响应结构**:
```json
{
  "movies": {
    "nowPlaying": [...],     // 正在热映
    "weeklyRanking": [...],  // 口碑榜单
    "top250": [...],         // 豆瓣高分
    "newMovies": [...],      // 最新电影
    "underratedMovies": [...] // 冷门佳片
  },
  "tv": {
    "hot": [...],           // 热门电视剧
    "top250": [...]         // 电视剧TOP250
  },
  "variety": {
    "hot": [...]            // 热门综艺
  },
  "anime": {
    "hot": [...]            // 热门动画
  },
  "timestamp": "ISO时间戳"
}
```

### 3. 电影相关接口

#### 3.1 正在热映电影
**端点**: `GET /api/movies/now-playing`

#### 3.2 口碑榜单
**端点**: `GET /api/movies/weekly`

#### 3.3 豆瓣高分TOP250
**端点**: `GET /api/movies/top250`

#### 3.4 最新电影
**端点**: `GET /api/movies/new`

#### 3.5 冷门佳片
**端点**: `GET /api/movies/underrated`

### 4. 电视剧相关接口

#### 4.1 热门电视剧
**端点**: `GET /api/tv/hot`

#### 4.2 电视剧TOP250
**端点**: `GET /api/tv/top250`

### 5. 综艺相关接口

#### 5.1 热门综艺
**端点**: `GET /api/variety/hot`

### 6. 动画相关接口

#### 6.1 热门动画
**端点**: `GET /api/anime/hot`

### 7. 搜索功能
搜索指定关键词的内容

**端点**: `GET /api/search`

**查询参数**:
- `q` (必需): 搜索关键词
- `type`: 搜索类型 (`all`, `movies`, `tv`, `variety`, `anime`)
- `limit`: 返回数量限制 (默认10)

**示例**: `GET /api/search?q=花&type=all&limit=5`

### 8. 统计信息
获取数据统计信息

**端点**: `GET /api/stats`

**响应示例**:
```json
{
  "timestamp": "2025-09-18T13:12:32.124Z",
  "totals": {
    "movies": 181,
    "tv": 45,
    "variety": 20,
    "anime": 20
  },
  "categories": {
    "movies": {
      "nowPlaying": 63,
      "weeklyRanking": 10,
      "top250": 25,
      "newMovies": 63,
      "underratedMovies": 20
    },
    "tv": {
      "hot": 20,
      "top250": 25
    }
  }
}
```

## 📊 数据结构

### 电影对象结构
```json
{
  "title": "电影名称",
  "score": 8.6,             // 评分
  "releaseDate": "2025",    // 上映日期
  "duration": "125分钟",     // 时长
  "region": "中国大陆",       // 地区
  "directors": ["导演1", "导演2"],
  "actors": ["演员1", "演员2"],
  "votes": 1000,            // 评价人数
  "poster": "海报URL",
  "link": "豆瓣详情页URL",
  "type": "now_playing"     // 类型标识
}
```

### 电视剧/综艺/动画对象结构
```json
{
  "title": "剧集名称",
  "score": 8.8,             // 评分
  "poster": "海报URL",
  "link": "豆瓣详情页URL",
  "type": "tv_hot"          // 类型标识
}
```

## 🛠 使用示例

### JavaScript Fetch示例
```javascript
// 获取正在热映电影
async function getNowPlaying() {
  const response = await fetch('http://localhost:3001/api/movies/now-playing');
  const data = await response.json();
  return data;
}

// 搜索功能
async function searchContent(query, type = 'all', limit = 10) {
  const url = `http://localhost:3001/api/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;
  const response = await fetch(url);
  return await response.json();
}
```

### Python requests示例
```python
import requests

# 获取热门电视剧
response = requests.get('http://localhost:3001/api/tv/hot')
data = response.json()

# 获取统计信息
stats = requests.get('http://localhost:3001/api/stats').json()
print(f"电影总数: {stats['totals']['movies']}")
```

## ⚙️ 部署配置

### 环境变量
- `PORT`: 服务端口 (默认: 3001)

### 启动命令
```bash
# 开发环境
node api-server.js

# 生产环境 (使用环境变量)
PORT=8080 node api-server.js
```

## 🔒 错误处理

所有接口返回标准HTTP状态码：
- `200`: 请求成功
- `400`: 请求参数错误
- `500`: 服务器内部错误

错误响应格式：
```json
{
  "error": "错误描述",
  "message": "详细错误信息"
}
```

## 📝 注意事项

1. **数据缓存**: 数据每30分钟更新一次
2. **请求频率**: 避免高频请求，建议客户端也实现缓存
3. **数据来源**: 数据来自豆瓣电影公开页面
4. **稳定性**: 豆瓣接口可能有访问限制，建议配置重试机制

## 🚀 快速开始

1. 安装依赖: `npm install`
2. 启动服务: `node api-server.js`
3. 测试接口: `curl http://localhost:3001/health`

---

## 🌐 部署指南

### 📋 部署方案对比

| 平台 | 适用场景 | 优势 | 限制 |
|------|----------|------|------|
| **Vercel** | 最佳选择 | 自动部署、serverless函数、CDN加速 | 有使用限制 |
| **GitHub Pages** | 静态页面+API代理 | 免费、稳定 | 需要额外API服务 |
| **Cloudflare Pages** | 同Vercel类似 | 全球CDN、免费额度高 | 配置稍复杂 |

### 🚀 Vercel 部署（推荐）

#### 1. 准备部署配置
创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api-server.js"
    }
  ]
}
```

#### 2. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 3. 部署到 Vercel
```bash
vercel --prod
```

#### 4. 环境变量配置
在 Vercel 控制台设置：
- `PORT`: 3000 (Vercel 固定端口)

### 🌐 Cloudflare Pages 部署

#### 1. 创建 `_functions/api/[[path]].js`

```javascript
import apiServer from '../../api-server.js';

export async function onRequest(context) {
  return apiServer.handleRequest(context);
}
```

#### 2. 创建 `wrangler.toml`

```toml
name = "douban-api"
compatibility_date = "2024-09-18"

[[functions]]
name = "api"
pattern = "/api/*"
script = "./_functions/api/[[path]].js"
```

#### 3. 部署命令
```bash
npm install -g wrangler
wrangler deploy
```

### 📊 GitHub Pages + Netlify Functions

#### 1. 创建 `netlify/functions/api.js`

```javascript
const apiServer = require('../api-server.js');

exports.handler = async (event, context) => {
  return apiServer.handleRequest(event);
};
```

#### 2. `netlify.toml` 配置

```toml
[build]
  publish = "."
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200
```

#### 3. 连接 GitHub 仓库到 Netlify

### 🔧 通用优化建议

#### 1. 环境变量配置
```javascript
// 在 api-server.js 开头添加
const PORT = process.env.PORT || 3001;
```

#### 2. CORS 配置更新
```javascript
// 允许所有源访问
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS']
}));
```

#### 3. 错误处理增强
```javascript
// 添加超时处理
app.use((req, res, next) => {
  req.setTimeout(10000, () => {
    res.status(504).json({ error: '请求超时' });
  });
  next();
});
```

#### 4. 部署前测试
创建测试脚本 `test-deploy.js`：
```javascript
const axios = require('axios');

async function testAPI(baseURL) {
  try {
    const response = await axios.get(`${baseURL}/health`);
    console.log('✅ API 健康检查通过:', response.data);
  } catch (error) {
    console.log('❌ API 测试失败:', error.message);
  }
}

// 测试本地
testAPI('http://localhost:3001');
```

### 📦 生产环境建议

#### 1. 添加监控
```bash
npm install express-rate-limit helmet
```

#### 2. 安全中间件
```javascript
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100次请求
});

app.use(helmet());
app.use(limiter);
```

#### 3. 日志记录
```javascript
const fs = require('fs');
const logStream = fs.createWriteStream('api.log', { flags: 'a' });

app.use((req, res, next) => {
  logStream.write(`${new Date().toISOString()} - ${req.method} ${req.url}\n`);
  next();
});
```

### 🚀 一键部署脚本

创建 `deploy.sh`：
```bash
#!/bin/bash

echo "开始部署豆瓣API..."

# 安装依赖
npm install

# 测试
node test-deploy.js

# 根据平台部署
if [ "$1" = "vercel" ]; then
  vercel --prod
elif [ "$1" = "netlify" ]; then
  netlify deploy --prod
else
  echo "请指定部署平台: vercel 或 netlify"
fi
```

使用：`./deploy.sh vercel`

### 📋 部署检查清单

- [ ] 环境变量配置正确
- [ ] CORS 设置允许跨域
- [ ] 速率限制已启用
- [ ] 错误处理完备
- [ ] 测试脚本通过
- [ ] 监控配置完成

**推荐使用 Vercel**，配置最简单，自动化程度最高！

---
*最后更新: 2025-09-18*
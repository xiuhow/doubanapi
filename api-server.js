const express = require('express');
const cors = require('cors');
const DoubanMovieSpider = require('./hot.js');

/**
 * 豆瓣电影数据API服务器
 */
class DoubanAPI {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.spider = new DoubanMovieSpider();
    this.cache = new Map();
    this.cacheTime = 30 * 60 * 1000; // 30分钟缓存

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * 设置中间件
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // 请求日志
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // 错误处理
    this.app.use((err, req, res, next) => {
      console.error('API Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    });
  }

  /**
   * 设置路由
   */
  setupRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 获取所有数据
    this.app.get('/api/all', async (req, res) => {
      try {
        const data = await this.getCachedData('all', () => this.spider.getAllData());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 电影相关API
    this.app.get('/api/movies/now-playing', async (req, res) => {
      try {
        const data = await this.getCachedData('movies_now_playing', () => this.spider.getNowPlaying());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/movies/weekly', async (req, res) => {
      try {
        const data = await this.getCachedData('movies_weekly', () => this.spider.getWeeklyRanking());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/movies/top250', async (req, res) => {
      try {
        const data = await this.getCachedData('movies_top250', () => this.spider.getTop250());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/movies/new', async (req, res) => {
      try {
        const data = await this.getCachedData('movies_new', () => this.spider.getNewMovies());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/movies/underrated', async (req, res) => {
      try {
        const data = await this.getCachedData('movies_underrated', () => this.spider.getUnderratedMovies());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 电视剧相关API
    this.app.get('/api/tv/hot', async (req, res) => {
      try {
        const data = await this.getCachedData('tv_hot', () => this.spider.getTVHot());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/tv/top250', async (req, res) => {
      try {
        const data = await this.getCachedData('tv_top250', async () => {
          const html = await this.spider.fetchWithRetry(this.spider.urls.tvTop);
          const $ = this.spider.cheerio.load(html);
          const tvTop = [];
          $('.grid_view .item').each((index, element) => {
            const $el = $(element);
            const title = $el.find('.title').first().text().trim();
            const score = $el.find('.rating_num').text().trim();
            const poster = $el.find('.pic img').attr('src');
            const link = $el.find('.pic a').attr('href');

            if (title) {
              tvTop.push({
                title,
                score: score ? parseFloat(score) : null,
                poster,
                link,
                type: 'tv_top250'
              });
            }
          });
          return tvTop;
        });
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 综艺相关API
    this.app.get('/api/variety/hot', async (req, res) => {
      try {
        const data = await this.getCachedData('variety_hot', () => this.spider.getVarietyHot());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 动画相关API
    this.app.get('/api/anime/hot', async (req, res) => {
      try {
        const data = await this.getCachedData('anime_hot', () => this.spider.getAnimeHot());
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 搜索功能
    this.app.get('/api/search', async (req, res) => {
      const { q, type = 'all', limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Missing query parameter "q"' });
      }

      try {
        const cacheKey = `search_${q}_${type}_${limit}`;
        const data = await this.getCachedData(cacheKey, async () => {
          const allData = await this.spider.getAllData();
          return this.searchData(allData, q, type, parseInt(limit));
        });

        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 统计信息
    this.app.get('/api/stats', async (req, res) => {
      try {
        const data = await this.getCachedData('stats', async () => {
          const allData = await this.spider.getAllData();
          return this.getStats(allData);
        });
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * 获取缓存数据
   */
  async getCachedData(key, fetcher) {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheTime) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  /**
   * 搜索数据
   */
  searchData(allData, query, type, limit) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    const searchInCategory = (categoryData, categoryName) => {
      if (!categoryData) return;

      if (Array.isArray(categoryData)) {
        categoryData.forEach(item => {
          if (item.title && item.title.toLowerCase().includes(lowerQuery)) {
            results.push({ ...item, category: categoryName });
          }
        });
      } else if (typeof categoryData === 'object') {
        Object.entries(categoryData).forEach(([subCategory, items]) => {
          if (Array.isArray(items)) {
            items.forEach(item => {
              if (item.title && item.title.toLowerCase().includes(lowerQuery)) {
                results.push({ ...item, category: `${categoryName}.${subCategory}` });
              }
            });
          }
        });
      }
    };

    if (type === 'all' || type === 'movies') {
      Object.values(allData.movies).forEach(movieData => {
        searchInCategory(movieData, 'movies');
      });
    }

    if (type === 'all' || type === 'tv') {
      Object.values(allData.tv).forEach(tvData => {
        searchInCategory(tvData, 'tv');
      });
    }

    if (type === 'all' || type === 'variety') {
      searchInCategory(allData.variety.hot, 'variety');
    }

    if (type === 'all' || type === 'anime') {
      searchInCategory(allData.anime.hot, 'anime');
    }

    return results.slice(0, limit);
  }

  /**
   * 获取统计信息
   */
  getStats(allData) {
    return {
      timestamp: allData.timestamp,
      totals: {
        movies: Object.values(allData.movies).reduce((sum, data) => sum + data.length, 0),
        tv: Object.values(allData.tv).reduce((sum, data) => sum + data.length, 0),
        variety: allData.variety.hot.length,
        anime: allData.anime.hot.length
      },
      categories: {
        movies: Object.keys(allData.movies).reduce((acc, key) => {
          acc[key] = allData.movies[key].length;
          return acc;
        }, {}),
        tv: Object.keys(allData.tv).reduce((acc, key) => {
          acc[key] = allData.tv[key].length;
          return acc;
        }, {})
      }
    };
  }

  /**
   * 启动服务器
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Douban API Server running on http://localhost:${this.port}`);
      console.log('📊 Available endpoints:');
      console.log('   GET /health - Health check');
      console.log('   GET /api/all - All data');
      console.log('   GET /api/movies/* - Movie endpoints');
      console.log('   GET /api/tv/* - TV endpoints');
      console.log('   GET /api/variety/* - Variety endpoints');
      console.log('   GET /api/anime/* - Anime endpoints');
      console.log('   GET /api/search?q=query - Search');
      console.log('   GET /api/stats - Statistics');
    });
  }

  /**
   * 平台适配方法 - 用于Netlify/Cloudflare
   */
  async handleRequest(event) {
    // 转换平台特定请求为Express格式
    const req = {
      method: event.httpMethod || event.request.method,
      path: event.path || new URL(event.request.url).pathname,
      query: event.queryStringParameters || {},
      headers: event.headers || {},
      body: event.body ? JSON.parse(event.body) : {}
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: '',

      status: function(code) {
        this.statusCode = code;
        return this;
      },

      json: function(data) {
        this.body = JSON.stringify(data);
        this.headers['Content-Type'] = 'application/json';
        return this;
      },

      setHeader: function(name, value) {
        this.headers[name] = value;
      }
    };

    try {
      await this.app._router.handle(req, res, () => {});

      return {
        statusCode: res.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          ...res.headers
        },
        body: res.body
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: error.message
        })
      };
    }
  }
}

// 启动服务器
if (require.main === module) {
  const apiServer = new DoubanAPI();
  apiServer.start();
}

module.exports = DoubanAPI;
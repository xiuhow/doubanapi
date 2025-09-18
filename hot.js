const axios = require('axios');
const cheerio = require('cheerio');
const config = require('./config');

/**
 * 豆瓣电影数据爬虫
 * 获取各种榜单数据
 */
class DoubanMovieSpider {
  constructor() {
    this.config = config;
    this.urls = config.urls;

    // 随机选择用户代理
    this.headers = {
      'User-Agent': config.userAgents[Math.floor(Math.random() * config.userAgents.length)],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  /**
   * 发送HTTP请求
   */
  async fetchWithRetry(url, retries = this.config.request.retries, isJson = false) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, {
          headers: {
            ...this.headers,
            ...(isJson ? { 'Accept': 'application/json' } : {})
          },
          timeout: this.config.request.timeout
        });
        return response.data;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, this.config.request.delay * (i + 1)));
      }
    }
  }

  /**
   * 获取正在热映电影
   */
  async getNowPlaying() {
    try {
      const html = await this.fetchWithRetry(this.urls.nowPlaying);
      const $ = cheerio.load(html);

      const movies = [];
      $('#nowplaying .list-item').each((index, element) => {
        const $el = $(element);
        const title = $el.attr('data-title');
        const score = $el.attr('data-score');
        const releaseDate = $el.attr('data-release');
        const duration = $el.attr('data-duration');
        const region = $el.attr('data-region');
        const directors = $el.attr('data-director');
        const actors = $el.attr('data-actors');
        const votes = $el.attr('data-votes');
        const poster = $el.find('.poster img').attr('src');
        const link = $el.find('a').attr('href');

        if (title) {
          movies.push({
            title,
            score: score ? parseFloat(score) : null,
            releaseDate,
            duration,
            region,
            directors: directors ? directors.split('/') : [],
            actors: actors ? actors.split('/') : [],
            votes: votes ? parseInt(votes) : 0,
            poster,
            link,
            type: 'now_playing'
          });
        }
      });

      return movies;
    } catch (error) {
      console.error('获取正在热映数据失败:', error.message);
      return [];
    }
  }

  /**
   * 获取豆瓣口碑榜
   */
  async getWeeklyRanking() {
    try {
      const html = await this.fetchWithRetry(this.urls.weekly);
      const $ = cheerio.load(html);

      const movies = [];
      $('.article .item').each((index, element) => {
        const $el = $(element);
        const title = $el.find('.pl2 a').text().trim();
        const scoreText = $el.find('.star .rating_nums').text();
        const votesText = $el.find('.star .pl').text();
        const poster = $el.find('.nbg img').attr('src');
        const link = $el.find('.pl2 a').attr('href');
        const description = $el.find('.pl2 p').text().trim();

        if (title) {
          const score = scoreText ? parseFloat(scoreText) : null;
          const votesMatch = votesText.match(/(\d+)\s*人评价/);
          const votes = votesMatch ? parseInt(votesMatch[1]) : 0;

          movies.push({
            title: title.replace(/\s+/g, ' '),
            score,
            votes,
            poster,
            link,
            description,
            type: 'weekly_ranking'
          });
        }
      });

      return movies;
    } catch (error) {
      console.error('获取口碑榜数据失败:', error.message);
      return [];
    }
  }

  /**
   * 获取豆瓣高分电影 (TOP250)
   */
  async getTop250() {
    try {
      const html = await this.fetchWithRetry(this.urls.top250);
      const $ = cheerio.load(html);

      const movies = [];
      $('.grid_view .item').each((index, element) => {
        const $el = $(element);
        const rank = $el.find('.pic em').text().trim();
        const title = $el.find('.title').first().text().trim();
        const score = $el.find('.rating_num').text().trim();
        const votesText = $el.find('.star span').last().text();
        const poster = $el.find('.pic img').attr('src');
        const link = $el.find('.pic a').attr('href');
        const quote = $el.find('.quote .inq').text().trim();

        if (title) {
          const votesMatch = votesText.match(/(\d+)/);
          const votes = votesMatch ? parseInt(votesMatch[1]) : 0;

          movies.push({
            rank: parseInt(rank),
            title,
            score: score ? parseFloat(score) : null,
            votes,
            poster,
            link,
            quote,
            type: 'top_250'
          });
        }
      });

      return movies;
    } catch (error) {
      console.error('获取TOP250数据失败:', error.message);
      return [];
    }
  }

  /**
   * 获取最新电影
   */
  async getNewMovies() {
    try {
      const html = await this.fetchWithRetry(this.urls.newMovies);
      const $ = cheerio.load(html);

      const movies = [];
      $('.screening-bd .ui-slide-item').each((index, element) => {
        const $el = $(element);
        const title = $el.attr('data-title');
        const score = $el.attr('data-rate');
        const poster = $el.find('.poster img').attr('src');
        const link = $el.find('a').attr('href');

        if (title) {
          movies.push({
            title,
            score: score ? parseFloat(score) : null,
            poster,
            link,
            type: 'new_movies'
          });
        }
      });

      return movies;
    } catch (error) {
      console.error('获取最新电影数据失败:', error.message);
      return [];
    }
  }

  /**
   * 获取冷门佳片 (通过搜索或特定分类)
   */
  async getUnderratedMovies() {
    try {
      // 通过低分高评价的电影来模拟冷门佳片
      const top250 = await this.getTop250();

      // 筛选评分较高但评价人数相对较少的电影
      return top250
        .filter(movie => movie.score >= this.config.underratedCriteria.minScore &&
                       movie.votes < this.config.underratedCriteria.maxVotes)
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.underratedCriteria.limit);
    } catch (error) {
      console.error('获取冷门佳片数据失败:', error.message);
      return [];
    }
  }

  /**
   * 处理API返回的剧集数据
   */
  processTVData(apiData, type) {
    if (!apiData || !apiData.subjects) return [];

    return apiData.subjects.map(item => ({
      title: item.title,
      score: item.rate ? parseFloat(item.rate) : null,
      poster: item.cover,
      link: item.url,
      type: type
    }));
  }

  /**
   * 获取热门电视剧
   */
  async getTVHot() {
    try {
      const data = await this.fetchWithRetry(this.urls.tvHot, this.config.request.retries, true);
      return this.processTVData(data, 'tv_hot');
    } catch (error) {
      console.error('获取热门电视剧数据失败:', error.message);
      return [];
    }
  }

  /**
   * 获取热门综艺
   */
  async getVarietyHot() {
    try {
      const data = await this.fetchWithRetry(this.urls.varietyHot, this.config.request.retries, true);
      return this.processTVData(data, 'variety_hot');
    } catch (error) {
      console.error('获取热门综艺数据失败:', error.message);
      return [];
    }
  }

  /**
   * 获取热门动画/动漫
   */
  async getAnimeHot() {
    try {
      const data = await this.fetchWithRetry(this.urls.animeHot, this.config.request.retries, true);
      return this.processTVData(data, 'anime_hot');
    } catch (error) {
      console.error('获取热门动画数据失败:', error.message);
      return [];
    }
  }

  /**
   * 获取所有榜单数据
   */
  async getAllData() {
    const [
      nowPlaying,
      weeklyRanking,
      top250,
      newMovies,
      underratedMovies,
      tvHot,
      varietyHot,
      animeHot
    ] = await Promise.all([
      this.getNowPlaying(),
      this.getWeeklyRanking(),
      this.getTop250(),
      this.getNewMovies(),
      this.getUnderratedMovies(),
      this.getTVHot(),
      this.getVarietyHot(),
      this.getAnimeHot()
    ]);

    // 获取电视剧TOP250（单独处理，避免并发过多）
    let tvTop = [];
    try {
      const html = await this.fetchWithRetry(this.urls.tvTop);
      const $ = cheerio.load(html);
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
    } catch (error) {
      console.error('获取电视剧TOP250数据失败:', error.message);
    }

    return {
      movies: {
        nowPlaying,
        weeklyRanking,
        top250,
        newMovies,
        underratedMovies
      },
      tv: {
        hot: tvHot,
        top250: tvTop
      },
      variety: {
        hot: varietyHot
      },
      anime: {
        hot: animeHot
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 导出数据到JSON文件
 */
function saveToFile(data, filename = 'douban_movies.json') {
  const fs = require('fs');
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
  console.log(`数据已保存到 ${filename}`);
}

// 使用示例
async function main() {
  const spider = new DoubanMovieSpider();

  console.log('开始爬取豆瓣电影数据...');

  try {
    // 获取所有数据
    const allData = await spider.getAllData();

    // 输出统计信息
    console.log('\n=== 数据统计 ===');
    console.log(`电影 - 正在热映: ${allData.movies.nowPlaying.length} 部`);
    console.log(`电影 - 口碑榜单: ${allData.movies.weeklyRanking.length} 部`);
    console.log(`电影 - 豆瓣高分: ${allData.movies.top250.length} 部`);
    console.log(`电影 - 最新电影: ${allData.movies.newMovies.length} 部`);
    console.log(`电影 - 冷门佳片: ${allData.movies.underratedMovies.length} 部`);
    console.log(`电视剧 - 热门: ${allData.tv.hot.length} 部`);
    console.log(`电视剧 - TOP250: ${allData.tv.top250.length} 部`);
    console.log(`综艺 - 热门: ${allData.variety.hot.length} 部`);
    console.log(`动画 - 热门: ${allData.anime.hot.length} 部`);

    // 保存到文件
    saveToFile(allData);

    // 显示部分数据样例
    console.log('\n=== 热门内容样例 ===');

    console.log('电影 - 正在热映:');
    allData.movies.nowPlaying.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} (${item.score}分)`);
    });

    console.log('电视剧 - 热门:');
    allData.tv.hot.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} (${item.score}分)`);
    });

    console.log('综艺 - 热门:');
    allData.variety.hot.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} (${item.score}分)`);
    });

    console.log('动画 - 热门:');
    allData.anime.hot.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} (${item.score}分)`);
    });

  } catch (error) {
    console.error('爬取过程出错:', error.message);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = DoubanMovieSpider;
/**
 * 爬虫配置文件
 * 包含各种配置参数和URL设置
 */

module.exports = {
  // 请求配置
  request: {
    timeout: 10000, // 10秒超时
    retries: 3,     // 重试次数
    delay: 1000,    // 重试延迟(ms)
  },

  // 用户代理列表（轮换使用避免被封）
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  ],

  // 豆瓣内容URL配置
  urls: {
    // 电影相关
    nowPlaying: 'https://movie.douban.com/cinema/nowplaying/',
    weekly: 'https://movie.douban.com/chart',
    top250: 'https://movie.douban.com/top250',
    newMovies: 'https://movie.douban.com/',
    underrated: 'https://movie.douban.com/j/search_subjects?type=movie&tag=冷门&sort=rank&page_limit=50&page_start=0',

    // 电视剧热门
    tvHot: 'https://movie.douban.com/j/search_subjects?type=tv&tag=热门&sort=recommend&page_limit=20&page_start=0',
    tvTop: 'https://movie.douban.com/top250?type=tv',

    // 综艺热门
    varietyHot: 'https://movie.douban.com/j/search_subjects?type=tv&tag=综艺&sort=recommend&page_limit=20&page_start=0',

    // 动画/动漫热门
    animeHot: 'https://movie.douban.com/j/search_subjects?type=tv&tag=日本动画&sort=recommend&page_limit=20&page_start=0',
  },

  // 选择器配置（根据页面结构可能会变化）
  selectors: {
    // 电影选择器
    nowPlaying: {
      container: '#nowplaying .list-item',
      title: 'data-title',
      score: 'data-score',
      poster: '.poster img',
      link: 'a'
    },
    weekly: {
      container: '.article .item',
      title: '.pl2 a',
      score: '.star .rating_nums',
      votes: '.star .pl',
      poster: '.nbg img'
    },
    top250: {
      container: '.grid_view .item',
      rank: '.pic em',
      title: '.title',
      score: '.rating_num',
      votes: '.star span:last-child',
      poster: '.pic img'
    },
    newMovies: {
      container: '.screening-bd .ui-slide-item',
      title: 'data-title',
      score: 'data-rate',
      poster: '.poster img'
    },

    // 电视剧选择器 (移动端)
    tvHot: {
      container: '.subject-item',
      title: '.title',
      score: '.rating',
      poster: '.cover img',
      link: 'a'
    },

    // 综艺选择器 (移动端搜索页)
    varietyHot: {
      container: '.search-result-item',
      title: '.title',
      score: '.rating',
      poster: '.cover img',
      link: 'a'
    },

    // 动画选择器 (移动端搜索页)
    animeHot: {
      container: '.search-result-item',
      title: '.title',
      score: '.rating',
      poster: '.cover img',
      link: 'a'
    }
  },

  // 冷门佳片筛选条件
  underratedCriteria: {
    minScore: 8.0,      // 最低评分
    maxVotes: 100000,   // 最大评价人数
    limit: 20          // 返回数量限制
  }
};
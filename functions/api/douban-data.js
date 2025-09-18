// 增强版豆瓣数据API - 支持所有榜单和类型
export async function onRequest({ request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'hot';
  const type = url.searchParams.get('type') || 'movie';
  const limit = url.searchParams.get('limit') || '20';

  try {
    // 定义不同类别的API配置
    const apiConfigs = {
      // 热门内容
      hot: {
        movie: { tag: '热门', sort: 'recommend' },
        tv: { tag: '热门', sort: 'recommend' }
      },
      // 高分内容
      high_rating: {
        movie: { tag: '豆瓣高分', sort: 'rank' },
        tv: { tag: '高分', sort: 'rank' }
      },
      // 最新内容
      new: {
        movie: { tag: '最新', sort: 'time' },
        tv: { tag: '最新', sort: 'time' }
      },
      // 动画/动漫（所有动画，不仅仅是日本动画）
      anime: {
        tv: { tag: '动画', sort: 'recommend' }
      },
      // 综艺
      variety: {
        tv: { tag: '综艺', sort: 'recommend' }
      },
      // 冷门佳片
      underrated: {
        movie: { tag: '冷门', sort: 'rank' }
      }
    };

    // 获取配置
    const config = apiConfigs[category]?.[type] || apiConfigs.hot.movie;

    const doubanUrl = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURIComponent(config.tag)}&sort=${config.sort}&page_limit=${limit}&page_start=0`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      'Referer': 'https://movie.douban.com/',
      'Origin': 'https://movie.douban.com'
    };

    const response = await fetch(doubanUrl, {
      headers,
      cf: {
        cacheTtl: 1800, // 缓存30分钟
        cacheEverything: true
      }
    });

    if (!response.ok) throw new Error(`豆瓣API请求失败: ${response.status}`);

    const result = await response.json();
    const items = result.subjects || [];

    return new Response(
      JSON.stringify({
        success: true,
        category: category,
        type: type,
        tag: config.tag,
        sort: config.sort,
        data: items,
        count: items.length,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'public, max-age=1800' // 客户端缓存30分钟
        }
      }
    );

  } catch (error) {
    // 失败时返回格式化错误信息
    return new Response(
      JSON.stringify({
        success: false,
        error: '获取数据失败',
        message: error.message,
        category: category,
        type: type,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
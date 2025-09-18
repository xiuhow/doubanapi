// API信息端点 - 显示可用的API
export async function onRequest() {
  return new Response(
    JSON.stringify({
      success: true,
      message: '豆瓣API服务',
      available_endpoints: [
        // 电影相关
        '/api/douban-data?category=hot&type=movie - 热门电影',
        '/api/douban-data?category=high_rating&type=movie - 豆瓣高分电影',
        '/api/douban-data?category=new&type=movie - 最新电影',
        '/api/douban-data?category=underrated&type=movie - 冷门佳片',

        // 电视剧相关
        '/api/douban-data?category=hot&type=tv - 热门电视剧',
        '/api/douban-data?category=high_rating&type=tv - 高分电视剧',
        '/api/douban-data?category=new&type=tv - 最新电视剧',

        // 动画/综艺
        '/api/douban-data?category=anime&type=tv - 热门动画（所有动画）',
        '/api/douban-data?category=variety&type=tv - 热门综艺',

        // 其他功能
        '/api/movies/search?q=关键词 - 搜索电影',
        '/api/movies/hot - 热门电影（重定向）',
        '/health - 健康检查',
        '/api/movies - API文档',
        '/api/info - 本页面'
      ],
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    }
  );
}
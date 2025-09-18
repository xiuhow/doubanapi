// 通用的电影API函数
export async function onRequest() {
  return new Response(
    JSON.stringify({
      success: true,
      message: '欢迎使用豆瓣电影API',
      endpoints: [
        '/api/movies/hot - 获取热门电影',
        '/api/movies/search - 搜索电影',
        '/health - 健康检查'
      ]
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
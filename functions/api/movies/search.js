// 处理 /api/movies/search 端点的函数
export async function onRequest({ request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(
      JSON.stringify({
        success: false,
        error: '搜索关键词不能为空',
        usage: '使用 ?q=关键词 进行搜索'
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      query: query,
      data: [
        { id: '111', title: `搜索结果1: ${query}`, rating: 7.5 },
        { id: '222', title: `搜索结果2: ${query}`, rating: 8.0 },
        { id: '333', title: `搜索结果3: ${query}`, rating: 6.8 }
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
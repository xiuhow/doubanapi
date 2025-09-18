// 简单的健康检查函数
export async function onRequest() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'API is healthy',
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
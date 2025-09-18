// 真正的热门电影API - 重定向到真实数据接口
export async function onRequest({ request }) {
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // 重定向到真实数据接口
  return Response.redirect(`${baseUrl}/api/real-hot`, 307);
}
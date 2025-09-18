const DoubanMovieSpider = require('./hot.js');

/**
 * 测试豆瓣电影爬虫
 */
async function testSpider() {
  const spider = new DoubanMovieSpider();

  console.log('=== 测试豆瓣电影爬虫 ===\n');

  // 测试单个功能
  console.log('1. 测试正在热映数据...');
  const nowPlaying = await spider.getNowPlaying();
  console.log(`   获取到 ${nowPlaying.length} 部正在热映电影`);

  console.log('2. 测试口碑榜单数据...');
  const weekly = await spider.getWeeklyRanking();
  console.log(`   获取到 ${weekly.length} 部口碑榜电影`);

  console.log('3. 测试豆瓣高分数据...');
  const top250 = await spider.getTop250();
  console.log(`   获取到 ${top250.length} 部高分电影`);

  console.log('4. 测试最新电影数据...');
  const newMovies = await spider.getNewMovies();
  console.log(`   获取到 ${newMovies.length} 部最新电影`);

  console.log('5. 测试冷门佳片数据...');
  const underrated = await spider.getUnderratedMovies();
  console.log(`   获取到 ${underrated.length} 部冷门佳片`);

  // 显示一些样例数据
  console.log('\n=== 数据样例 ===');
  if (nowPlaying.length > 0) {
    console.log('正在热映第一部:', nowPlaying[0].title);
  }
  if (weekly.length > 0) {
    console.log('口碑榜第一部:', weekly[0].title);
  }
  if (top250.length > 0) {
    console.log('TOP250第一部:', top250[0].title);
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testSpider().catch(console.error);
const DoubanMovieSpider = require('./hot.js');

/**
 * 使用示例
 * 展示如何调用豆瓣电影爬虫
 */

async function exampleUsage() {
  const spider = new DoubanMovieSpider();

  console.log('=== 豆瓣电影爬虫使用示例 ===\n');

  // 1. 获取单个榜单
  console.log('1. 获取正在热映电影:');
  const nowPlaying = await spider.getNowPlaying();
  console.log(`   数量: ${nowPlaying.length}`);
  if (nowPlaying.length > 0) {
    console.log(`   示例: ${nowPlaying[0].title} (${nowPlaying[0].score}分)`);
  }

  // 2. 获取所有榜单
  console.log('\n2. 获取所有榜单数据:');
  const allData = await spider.getAllData();
  console.log(`   正在热映: ${allData.nowPlaying.length}`);
  console.log(`   口碑榜单: ${allData.weeklyRanking.length}`);
  console.log(`   豆瓣高分: ${allData.top250.length}`);
  console.log(`   最新电影: ${allData.newMovies.length}`);
  console.log(`   冷门佳片: ${allData.underratedMovies.length}`);

  // 3. 保存数据到文件
  console.log('\n3. 保存数据到JSON文件:');
  const fs = require('fs');
  fs.writeFileSync('douban_data.json', JSON.stringify(allData, null, 2));
  console.log('   数据已保存到 douban_data.json');

  // 4. 筛选特定数据
  console.log('\n4. 高分电影推荐 (评分 ≥ 9.0):');
  const highScoreMovies = allData.top250.filter(movie => movie.score >= 9.0);
  highScoreMovies.forEach((movie, index) => {
    console.log(`   ${index + 1}. ${movie.title} - ${movie.score}分`);
  });

  console.log('\n=== 示例完成 ===');
}

// 运行示例
exampleUsage().catch(console.error);
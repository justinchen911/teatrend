/**
 * 小红书搜索采集脚本
 * 功能：搜索"凤凰单丛"关键词，采集笔记列表信息
 * 
 * 特性：
 * - 使用有头模式（避免被检测为机器人）
 * - 模拟人类操作节奏（随机等待 3-8 秒）
 * - 自动翻页加载更多结果
 * - 异常时保存已采集数据
 * - 自动复用登录态（cookie 持久化）
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前脚本所在目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 配置项
const CONFIG = {
  // 搜索关键词
  keyword: '凤凰单丛',
  // 搜索页面 URL
  searchUrl: 'https://www.xhs.com/search_result?keyword=凤凰单丛',
  // 翻页次数（默认翻 3 页 = 4 页内容）
  maxPages: 3,
  // 最小等待时间（秒）
  minWait: 3,
  // 最大等待时间（秒）
  maxWait: 8,
  // 输出目录
  outputDir: path.join(__dirname, 'output'),
};

// 工具函数：生成指定范围的随机等待时间
function randomWait(minSec, maxSec) {
  const delay = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
  console.log(`  ⏳ 等待 ${delay} 秒...`);
  return new Promise(resolve => setTimeout(resolve, delay * 1000));
}

// 工具函数：确保输出目录存在
async function ensureOutputDir() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// 工具函数：保存采集结果到 JSON 文件
async function saveResults(results, prefix = 'search') {
  const today = new Date().toISOString().split('T')[0];
  const filename = `${prefix}-${today}.json`;
  const filepath = path.join(CONFIG.outputDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`  ✅ 结果已保存: ${filepath}`);
  return filepath;
}

/**
 * 从页面中提取搜索结果卡片数据
 * 小红书的搜索结果通常在一个列表容器中，每条笔记是一个卡片
 */
async function extractSearchResults(page) {
  // 等待搜索结果加载（等待笔记卡片出现）
  await page.waitForSelector('.note-item, [class*="search-card"], [class*="feed-item"]', {
    timeout: 10000
  }).catch(() => {
    console.log('  ⚠️ 未找到标准搜索结果容器，尝试备选选择器...');
  });

  // 提取每条笔记的信息
  const results = await page.evaluate(() => {
    const cards = document.querySelectorAll(
      '.note-item, [class*="search-card"], [class*="feed-item"], [class*="cover"][class*="info"]'
    );
    
    const data = [];
    cards.forEach((card) => {
      // 提取标题（可能在多个位置）
      const titleEl = card.querySelector('.title, [class*="title"], h2, h3, a[href*="/discovery"]');
      const title = titleEl?.textContent?.trim() || '';
      
      // 提取作者信息
      const authorEl = card.querySelector('.author, [class*="author"], [class*="user"], .name, a[href*="/user"]');
      const authorName = authorEl?.textContent?.trim() || '';
      
      // 提取作者主页链接
      const authorLinkEl = card.querySelector('a[href*="/user/profile/"]');
      const authorLink = authorLinkEl ? 'https://www.xhs.com' + authorLinkEl.getAttribute('href') : '';
      
      // 提取点赞数
      const likeEl = card.querySelector('[class*="like"], [class*="liked"], [class*="count"]');
      let likes = '';
      if (likeEl) {
        const text = likeEl.textContent || '';
        // 提取数字，处理万、w 等单位
        likes = text.replace(/[^0-9wW万]/g, '');
      }
      
      // 提取封面图 URL
      const coverEl = card.querySelector('img[src*="http"], img[data-src]');
      let coverUrl = '';
      if (coverEl) {
        coverUrl = coverEl.getAttribute('src') || coverEl.getAttribute('data-src') || '';
      }
      
      // 提取笔记链接
      const noteLinkEl = card.querySelector('a[href*="/discovery/item/"], a[href*="/pin/"]');
      const noteLink = noteLinkEl ? 'https://www.xhs.com' + noteLinkEl.getAttribute('href') : '';
      
      // 只保留有实质内容的记录
      if (title || noteLink) {
        data.push({
          title,
          authorName,
          authorLink,
          likes,
          coverUrl,
          noteLink,
          // 记录采集时间
          scrapedAt: new Date().toISOString(),
        });
      }
    });
    
    return data;
  });

  return results;
}

/**
 * 滚动页面以加载更多内容
 * 小红书通常通过无限滚动加载更多结果
 */
async function scrollAndLoadMore(page, pageNum) {
  console.log(`\n📄 第 ${pageNum + 1} 页: 开始滚动加载...`);
  
  // 获取当前页面高度
  const getScrollHeight = () => page.evaluate(() => document.body.scrollHeight);
  const getScrollTop = () => page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
  
  let prevHeight = await getScrollHeight();
  let scrollAttempts = 0;
  const maxScrollAttempts = 5;
  
  while (scrollAttempts < maxScrollAttempts) {
    // 渐进式滚动：每次滚动 500px
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    
    // 等待新内容加载
    await randomWait(1, 2);
    
    const newHeight = await getScrollHeight();
    const newScrollTop = await getScrollTop();
    
    // 如果页面高度没有变化，说明已经加载完毕
    if (newHeight === prevHeight && newScrollTop >= prevHeight - 100) {
      scrollAttempts++;
      console.log(`  滚动尝试 ${scrollAttempts}/${maxScrollAttempts}`);
    } else {
      scrollAttempts = 0;
      prevHeight = newHeight;
    }
    
    // 安全限制：滚动到底部附近即可
    if (newScrollTop > prevHeight * 3) break;
  }
  
  console.log(`  ✅ 第 ${pageNum + 1} 页加载完成`);
}

/**
 * 点击下一页按钮
 */
async function goToNextPage(page) {
  try {
    // 查找"下一页"或"加载更多"按钮
    const nextButton = await page.waitForSelector(
      '.next, [class*="next"], [class*="page-next"], button:has-text("下一页"), a:has-text("下一页")',
      { timeout: 5000 }
    );
    
    if (nextButton) {
      console.log('  🔄 点击下一页...');
      await nextButton.click();
      // 等待页面跳转或内容更新
      await randomWait(CONFIG.minWait, CONFIG.maxWait);
      return true;
    }
  } catch (err) {
    console.log('  ⚠️ 未找到下一页按钮，可能已到最后一页');
  }
  return false;
}

/**
 * 主函数：执行搜索采集
 */
async function scrapeSearch() {
  console.log('\n🔍 小红书搜索采集脚本启动');
  console.log(`📌 关键词: ${CONFIG.keyword}`);
  console.log(`📄 翻页次数: ${CONFIG.maxPages}`);
  
  let browser;
  let allResults = [];
  
  try {
    // 确保输出目录存在
    await ensureOutputDir();
    
    // 启动浏览器（有头模式 - 避免被检测）
    console.log('\n🚀 启动浏览器...');
    browser = await chromium.launch({
      headless: false, // 有头模式，防止被检测
      slowMo: 50, // 操作延迟，让行为更像人类
      args: [
        '--disable-blink-features=AutomationControlled', // 隐藏自动化特征
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    
    // 创建浏览器上下文（隔离 cookie）
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      // 尝试复用已保存的登录态
      storageState: path.join(__dirname, 'auth', 'storage-state.json'),
    });
    
    const page = await context.newPage();
    
    // 设置反检测：移除 webdriver 属性
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    
    // 拦截请求（可选：记录请求日志）
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`  ❌ Console Error: ${msg.text()}`);
      }
    });
    
    // 访问搜索页面
    console.log(`\n🌐 访问: ${CONFIG.searchUrl}`);
    await page.goto(CONFIG.searchUrl, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    // 首次运行检测登录状态
    const loginCheck = await page.evaluate(() => {
      // 小红书登录后会显示用户头像等元素
      const isLoggedIn = !!document.querySelector('.user-avatar, [class*="avatar"], [class*="user-info"]');
      return isLoggedIn;
    });
    
    if (!loginCheck) {
      console.log('\n⚠️ 检测到未登录状态！');
      console.log('📋 请手动扫码或账号登录小红书...');
      console.log('💡 登录成功后，按 Enter 继续（或等待 60 秒自动继续）...');
      
      // 等待用户登录（最多 60 秒）
      await page.waitForTimeout(60000);
    } else {
      console.log('✅ 已检测到登录状态');
    }
    
    // 首次访问后保存登录态，以便后续复用
    await context.storageState({
      path: path.join(__dirname, 'auth', 'storage-state.json'),
    }).catch(() => {
      console.log('  ⚠️ 无法保存登录态（目录可能不存在）');
    });
    
    // 逐页采集
    for (let pageNum = 0; pageNum <= CONFIG.maxPages; pageNum++) {
      console.log(`\n========== 第 ${pageNum + 1} 页 ==========`);
      
      // 等待当前页内容加载
      await randomWait(CONFIG.minWait, CONFIG.maxWait);
      
      // 滚动加载当前页更多内容
      await scrollAndLoadMore(page, pageNum);
      
      // 提取当前页数据
      const pageResults = await extractSearchResults(page);
      console.log(`  📊 本页采集到 ${pageResults.length} 条记录`);
      
      allResults.push(...pageResults);
      
      // 如果还有更多页，点击下一页
      if (pageNum < CONFIG.maxPages) {
        const hasNext = await goToNextPage(page);
        if (!hasNext) {
          console.log('  ⚠️ 已到最后一页，停止翻页');
          break;
        }
      }
    }
    
    // 保存结果
    const savedPath = await saveResults(allResults);
    
    console.log('\n========== 采集完成 ==========');
    console.log(`📊 总计采集: ${allResults.length} 条笔记`);
    console.log(`💾 结果文件: ${savedPath}`);
    
    return {
      success: true,
      totalCount: allResults.length,
      savedPath,
      results: allResults,
    };
    
  } catch (error) {
    console.error('\n❌ 采集过程中发生错误:', error.message);
    
    // 无论如何，尝试保存已采集的数据
    if (allResults.length > 0) {
      console.log('\n💾 保存已采集的数据...');
      await saveResults(allResults);
    }
    
    return {
      success: false,
      error: error.message,
      totalCount: allResults.length,
      results: allResults,
    };
    
  } finally {
    // 关闭浏览器
    if (browser) {
      await browser.close();
      console.log('\n👋 浏览器已关闭');
    }
  }
}

// 直接运行时执行采集
scrapeSearch().then(result => {
  console.log('\n📝 返回结果:', JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

// 导出函数供其他模块调用
export { scrapeSearch };

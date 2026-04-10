/**
 * 小红书账号详情采集脚本
 * 功能：遍历种子账号池，采集每个账号的主页信息
 * 
 * 特性：
 * - 从 seed-accounts.json 读取活跃账号列表
 * - 有头模式运行，模拟真实用户访问
 * - 随机等待 5-10 秒，避免请求过快
 * - 异常时保存已采集数据
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'fileURLToPath' with { type: 'module' };

// 获取当前脚本所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置项
const CONFIG = {
  // 种子账号池文件路径
  seedFile: path.join(__dirname, 'seed-accounts.json'),
  // 输出目录
  outputDir: path.join(__dirname, 'output'),
  // 最小等待时间（秒）
  minWait: 5,
  // 最大等待时间（秒）
  maxWait: 10,
  // 登录态持久化目录
  authDir: path.join(__dirname, 'auth'),
};

// 工具函数：随机等待
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

// 工具函数：确保 auth 目录存在
async function ensureAuthDir() {
  try {
    await fs.mkdir(CONFIG.authDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// 工具函数：保存采集结果
async function saveResults(results, prefix = 'profiles') {
  const today = new Date().toISOString().split('T')[0];
  const filename = `${prefix}-${today}.json`;
  const filepath = path.join(CONFIG.outputDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`  ✅ 结果已保存: ${filepath}`);
  return filepath;
}

// 工具函数：加载种子账号池
async function loadSeedAccounts() {
  try {
    const content = await fs.readFile(CONFIG.seedFile, 'utf-8');
    const accounts = JSON.parse(content);
    
    // 筛选活跃的小红书账号
    const activeAccounts = accounts.filter(
      acc => acc.platform === 'xiaohongshu' && acc.isActive === true
    );
    
    console.log(`📋 共加载 ${activeAccounts.length} 个活跃账号`);
    return activeAccounts;
  } catch (err) {
    console.error(`❌ 无法读取种子账号池: ${err.message}`);
    return [];
  }
}

/**
 * 从账号主页提取用户信息
 */
async function extractProfile(page) {
  // 等待页面主要元素加载
  await page.waitForSelector('[class*="user"], [class*="profile"], [class*="info"]', {
    timeout: 10000
  }).catch(() => {
    console.log('  ⚠️ 页面结构可能不匹配标准样式');
  });

  // 提取用户资料
  const profile = await page.evaluate(() => {
    // 昵称：通常在用户名的位置
    const nicknameEl = document.querySelector(
      '.user-name, [class*="nickname"], [class*="userName"], 
      [class*="name"][class*="user"], h1, .username'
    );
    const nickname = nicknameEl?.textContent?.trim() || '';
    
    // 简介/签名
    const descEl = document.querySelector(
      '.user-desc, [class*="desc"], [class*="signature"], 
      [class*="about"], .intro, [class*="description"]'
    );
    const description = descEl?.textContent?.trim() || '';
    
    // 所在地
    const locationEl = document.querySelector(
      '.user-location, [class*="location"], [class*="address"],
      [class*="city"], [class*="region"]'
    );
    const location = locationEl?.textContent?.trim() || '';
    
    // 粉丝数
    const fansEl = document.querySelector(
      '[class*="fans"], [class*="follower"], [class*="粉丝"],
      [class*="count"]:has-text("粉丝")'
    );
    let fansCount = '';
    if (fansEl) {
      const text = fansEl.textContent || '';
      fansCount = text.replace(/[^0-9wW万]*/g, '').trim();
    }
    
    // 关注数
    const followEl = document.querySelector(
      '[class*="follow"]:not([class*="followers"]):not([class*="following"]), 
       [class*="following"], [class*="关注"]'
    );
    let followCount = '';
    if (followEl) {
      const text = followEl.textContent || '';
      followCount = text.replace(/[^0-9wW万]*/g, '').trim();
    }
    
    // 笔记数
    const notesEl = document.querySelector(
      '[class*="note"], [class*="post"], [class*="笔记"], [class*="内容"]'
    );
    let notesCount = '';
    if (notesEl) {
      const text = notesEl.textContent || '';
      notesCount = text.replace(/[^0-9wW万]*/g, '').trim();
    }
    
    return {
      nickname,
      description,
      location,
      fansCount,
      followCount,
      notesCount,
    };
  });

  return profile;
}

/**
 * 采集单个账号的信息
 */
async function scrapeProfile(page, account, index, total) {
  console.log(`\n[${index + 1}/${total}] 正在采集: ${account.note || account.homeUrl}`);
  console.log(`  🔗 访问: ${account.homeUrl}`);
  
  try {
    // 访问账号主页
    await page.goto(account.homeUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    
    // 随机等待让页面完全渲染
    await randomWait(2, 4);
    
    // 检测是否需要登录
    const needsLogin = await page.evaluate(() => {
      return !document.querySelector('.user-info, [class*="profile"], [class*="user"]');
    });
    
    if (needsLogin) {
      console.log('  ⚠️ 需要登录才能查看完整信息');
      return {
        ...account,
        success: false,
        error: '需要登录',
        data: null,
      };
    }
    
    // 提取用户资料
    const profile = await extractProfile(page);
    
    console.log(`  ✅ 昵称: ${profile.nickname || '未获取到'}`);
    console.log(`  📍 所在地: ${profile.location || '未获取到'}`);
    console.log(`  👥 粉丝: ${profile.fansCount || '未获取到'}`);
    
    return {
      ...account,
      success: true,
      data: profile,
      scrapedAt: new Date().toISOString(),
    };
    
  } catch (err) {
    console.error(`  ❌ 采集失败: ${err.message}`);
    return {
      ...account,
      success: false,
      error: err.message,
      data: null,
    };
  }
}

/**
 * 主函数：批量采集账号详情
 */
async function scrapeProfiles() {
  console.log('\n👤 小红书账号详情采集脚本启动');
  
  let browser;
  const allResults = [];
  
  try {
    // 确保必要目录存在
    await ensureOutputDir();
    await ensureAuthDir();
    
    // 加载种子账号
    const accounts = await loadSeedAccounts();
    
    if (accounts.length === 0) {
      console.log('⚠️ 没有找到活跃的小红书账号');
      return {
        success: true,
        totalAccounts: 0,
        results: [],
      };
    }
    
    // 启动浏览器
    console.log('\n🚀 启动浏览器...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 50,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    
    // 创建上下文（复用登录态）
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      storageState: path.join(CONFIG.authDir, 'storage-state.json'),
    });
    
    const page = await context.newPage();
    
    // 移除 webdriver 属性
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    
    // 依次采集每个账号
    for (let i = 0; i < accounts.length; i++) {
      const result = await scrapeProfile(page, accounts[i], i, accounts.length);
      allResults.push(result);
      
      // 账号间随机等待
      if (i < accounts.length - 1) {
        console.log(`  ⏳ 账号间等待...`);
        await randomWait(CONFIG.minWait, CONFIG.maxWait);
      }
    }
    
    // 保存结果
    const savedPath = await saveResults(allResults);
    
    // 统计
    const successCount = allResults.filter(r => r.success).length;
    
    console.log('\n========== 采集完成 ==========');
    console.log(`📊 总计账号: ${allResults.length}`);
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失败: ${allResults.length - successCount}`);
    console.log(`💾 结果文件: ${savedPath}`);
    
    return {
      success: true,
      totalAccounts: allResults.length,
      successCount,
      savedPath,
      results: allResults,
    };
    
  } catch (error) {
    console.error('\n❌ 采集过程中发生错误:', error.message);
    
    // 保存已采集数据
    if (allResults.length > 0) {
      console.log('\n💾 保存已采集的数据...');
      await saveResults(allResults);
    }
    
    return {
      success: false,
      error: error.message,
      totalAccounts: allResults.length,
      results: allResults,
    };
    
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n👋 浏览器已关闭');
    }
  }
}

// 直接运行时执行采集
scrapeProfiles().then(result => {
  console.log('\n📝 返回结果:', JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

// 导出函数
export { scrapeProfiles };

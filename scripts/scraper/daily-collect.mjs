/**
 * 每日采集编排脚本
 * 功能：依次执行搜索采集 + 账号详情采集，汇总报告
 * 
 * 特性：
 * - 彩色执行日志
 * - 统计汇总
 * - 生成执行报告
 */

import { promises as fs } from 'fs';
import path from 'fileURLToPath' with { type: 'module' };

// 获取脚本目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== 彩色日志工具 ==========
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  // 前景色
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // 背景色
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

const log = {
  // 标题/横幅
  title(text) {
    console.log(`\n${COLORS.bold}${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.cyan}  ${text}${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}\n`);
  },
  
  // 成功信息
  success(text) {
    console.log(`${COLORS.green}✅ ${text}${COLORS.reset}`);
  },
  
  // 错误信息
  error(text) {
    console.log(`${COLORS.red}❌ ${text}${COLORS.reset}`);
  },
  
  // 警告信息
  warn(text) {
    console.log(`${COLORS.yellow}⚠️  ${text}${COLORS.reset}`);
  },
  
  // 提示信息
  info(text) {
    console.log(`${COLORS.blue}ℹ️  ${text}${COLORS.reset}`);
  },
  
  // 进度信息
  progress(text) {
    console.log(`${COLORS.magenta}🔄 ${text}${COLORS.reset}`);
  },
  
  // 统计数据
  stat(label, value, color = COLORS.green) {
    console.log(`  ${COLORS.dim}│${COLORS.reset} ${label}: ${color}${value}${COLORS.reset}`);
  },
  
  // 分隔线
  divider() {
    console.log(`\n${COLORS.dim}${'─'.repeat(60)}${COLORS.reset}\n`);
  },
};

// ========== 配置 ==========
const CONFIG = {
  outputDir: path.join(__dirname, 'output'),
};

// ========== 工具函数 ==========

/**
 * 确保输出目录存在
 */
async function ensureOutputDir() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * 保存执行报告
 */
async function saveReport(report) {
  const today = new Date().toISOString().split('T')[0];
  const filename = `report-${today}.json`;
  const filepath = path.join(CONFIG.outputDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf-8');
  log.success(`报告已保存: ${filepath}`);
  return filepath;
}

/**
 * 加载模块（动态 import）
 */
async function importModule(name) {
  const modulePath = path.join(__dirname, name);
  return await import(modulePath);
}

// ========== 主流程 ==========

/**
 * 执行每日采集
 */
async function runDailyCollection() {
  const startTime = Date.now();
  
  log.title('小红书每日采集任务');
  
  console.log(`${COLORS.dim}开始时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}${COLORS.reset}\n`);
  
  // 初始化统计
  const report = {
    taskId: `daily-${Date.now()}`,
    startedAt: new Date().toISOString(),
    completedAt: null,
    duration: null,
    tasks: [],
    summary: {
      totalSearchResults: 0,
      totalProfiles: 0,
      successCount: 0,
      errorCount: 0,
      hasErrors: false,
    },
  };
  
  try {
    // 确保输出目录
    await ensureOutputDir();
    
    // ========== 任务 1: 搜索采集 ==========
    log.progress('任务 1/2: 执行搜索采集...');
    log.divider();
    
    try {
      const searchModule = await importModule('./xiaohongshu-search.mjs');
      const searchResult = await searchModule.scrapeSearch();
      
      report.tasks.push({
        name: 'search',
        status: searchResult.success ? 'success' : 'failed',
        ...searchResult,
      });
      
      report.summary.totalSearchResults = searchResult.totalCount || 0;
      
      if (searchResult.success) {
        log.success(`搜索采集完成: 获得 ${searchResult.totalCount} 条记录`);
      } else {
        log.error(`搜索采集失败: ${searchResult.error}`);
        log.warn(`部分数据已保存: ${searchResult.totalCount} 条`);
      }
    } catch (err) {
      log.error(`搜索采集模块加载失败: ${err.message}`);
      report.tasks.push({
        name: 'search',
        status: 'error',
        error: err.message,
      });
      report.summary.hasErrors = true;
    }
    
    log.divider();
    
    // ========== 任务 2: 账号详情采集 ==========
    log.progress('任务 2/2: 执行账号详情采集...');
    log.divider();
    
    try {
      const profileModule = await importModule('./xiaohongshu-profile.mjs');
      const profileResult = await profileModule.scrapeProfiles();
      
      report.tasks.push({
        name: 'profile',
        status: profileResult.success ? 'success' : 'failed',
        ...profileResult,
      });
      
      report.summary.totalProfiles = profileResult.totalAccounts || 0;
      report.summary.successCount = profileResult.successCount || 0;
      report.summary.errorCount = (profileResult.totalAccounts || 0) - (profileResult.successCount || 0);
      
      if (profileResult.success) {
        log.success(`账号采集完成: ${profileResult.successCount}/${profileResult.totalAccounts} 个账号`);
      } else {
        log.error(`账号采集失败: ${profileResult.error}`);
      }
    } catch (err) {
      log.error(`账号采集模块加载失败: ${err.message}`);
      report.tasks.push({
        name: 'profile',
        status: 'error',
        error: err.message,
      });
      report.summary.hasErrors = true;
    }
    
    log.divider();
    
    // ========== 汇总统计 ==========
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    report.completedAt = new Date().toISOString();
    report.duration = `${duration} 秒`;
    
    log.title('📊 采集汇总报告');
    
    log.stat('搜索结果', `${report.summary.totalSearchResults} 条`, COLORS.cyan);
    log.stat('账号采集', `${report.summary.totalProfiles} 个`, COLORS.cyan);
    log.stat('成功', `${report.summary.successCount}`, COLORS.green);
    log.stat('失败', `${report.summary.errorCount}`, report.summary.errorCount > 0 ? COLORS.red : COLORS.green);
    log.stat('执行耗时', `${duration} 秒`, COLORS.yellow);
    log.stat('总体状态', report.summary.hasErrors ? '⚠️ 有错误' : '✅ 全部成功', 
      report.summary.hasErrors ? COLORS.yellow : COLORS.green);
    
    console.log();
    
    // 保存报告
    const reportPath = await saveReport(report);
    
    console.log(`\n${COLORS.dim}结束时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}${COLORS.reset}`);
    
    return report;
    
  } catch (err) {
    log.error(`执行过程中发生未捕获错误: ${err.message}`);
    report.completedAt = new Date().toISOString();
    report.duration = `${Math.round((Date.now() - startTime) / 1000)} 秒`;
    report.fatalError = err.message;
    report.summary.hasErrors = true;
    
    await saveReport(report);
    
    return report;
  }
}

// ========== 入口 ==========

runDailyCollection()
  .then(report => {
    console.log('\n');
    if (report.summary.hasErrors) {
      console.log(`${COLORS.yellow}${COLORS.bold}⚠️ 采集任务已完成，但有部分错误，请查看报告${COLORS.reset}\n`);
      process.exit(1);
    } else {
      console.log(`${COLORS.green}${COLORS.bold}🎉 全部采集任务执行成功！${COLORS.reset}\n`);
      process.exit(0);
    }
  })
  .catch(err => {
    log.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });

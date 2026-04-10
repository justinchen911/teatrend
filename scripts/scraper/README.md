# 小红书 RPA 采集脚本

基于 Playwright 的小红书数据采集工具，采用有头浏览器模式模拟真实用户操作。

## 功能特性

- 🔍 **搜索采集** - 按关键词搜索笔记，提取标题、作者、点赞数等信息
- 👤 **账号采集** - 批量采集账号主页的粉丝数、简介等详情
- 📊 **每日报告** - 自动汇总采集结果，生成执行报告
- 🛡️ **反检测** - 有头模式 + 随机延迟 + 自动化特征隐藏
- 💾 **容错保存** - 任何步骤失败都会保存已采集数据

## 快速开始

### 1. 安装依赖

```bash
cd scripts/scraper
npm install
```

### 2. 安装浏览器

```bash
npx playwright install chromium
```

### 3. 首次运行 - 登录小红书

```bash
# 搜索采集（首次运行会提示登录）
npm run scrape:search

# 或直接运行每日采集（包含两个任务）
npm run scrape:daily
```

> ⚠️ **重要**: 首次运行时需要手动扫码/账号登录小红书。登录后 cookie 会自动保存，后续运行无需重复登录。

### 4. 查看采集结果

采集结果保存在 `output/` 目录下：

```
output/
├── search-2024-01-15.json    # 搜索采集结果
├── profiles-2024-01-15.json  # 账号采集结果
└── report-2024-01-15.json    # 每日执行报告
```

## 脚本说明

### 单独运行

```bash
# 搜索采集
npm run scrape:search

# 账号详情采集
npm run scrape:profile

# 完整每日采集
npm run scrape:daily
```

### 修改搜索关键词

编辑 `xiaohongshu-search.mjs`，修改：

```javascript
const CONFIG = {
  keyword: '凤凰单丛',  // 修改这里
  maxPages: 3,         // 翻页次数
};
```

### 修改翻页次数

```javascript
const CONFIG = {
  // ...
  maxPages: 5,  // 默认翻 3 页（采集 4 页内容）
};
```

## 种子账号池维护

编辑 `seed-accounts.json` 添加/管理要采集的账号：

```json
[
  {
    "platform": "xiaohongshu",
    "accountId": "your_account_id",
    "homeUrl": "https://www.xhs.com/user/profile/xxxxx",
    "note": "账号备注说明",
    "isActive": true
  }
]
```

**字段说明：**
- `platform`: 平台标识，固定为 `xiaohongshu`
- `accountId`: 账号唯一标识
- `homeUrl`: 账号主页 URL
- `note`: 备注信息（方便识别）
- `isActive`: 是否启用采集，`true` = 采集，`false` = 跳过

## 注意事项

### ⚠️ 频率控制

脚本内置了随机等待机制：
- 页面操作间：**3-8 秒**随机等待
- 账号采集间：**5-10 秒**随机等待
- 翻页加载：**1-2 秒**滚动间隔

> 💡 如需调整等待时间，修改各脚本中的 `CONFIG.minWait` / `CONFIG.maxWait`

### ⚠️ 账号安全

1. **不要频繁采集** - 建议每天最多运行 1-2 次
2. **避开高峰期** - 晚间 8-11 点小红书风控较严
3. **使用小号** - 建议用备用账号进行采集，主号有封禁风险
4. **观察账号状态** - 如出现验证码激增，暂停采集

### ⚠️ 数据存储

- 采集结果和登录态保存在本地
- `output/` 和 `auth/` 目录已加入 `.gitignore`
- **不要提交 cookie 文件到 Git！**

## 常见问题

### Q: 提示 "需要登录"？

首次运行需要手动登录。登录后 cookie 会自动保存到 `auth/storage-state.json`。

如果仍提示登录，删除 `auth/` 目录后重新运行：

```bash
rm -rf auth/
npm run scrape:search
```

### Q: 页面结构获取不到数据？

小红书页面结构可能更新。可以：
1. 手动打开页面，检查选择器
2. 在浏览器开发者工具中调试
3. 根据实际页面结构调整 `extractSearchResults()` / `extractProfile()` 中的选择器

### Q: 采集数量为 0？

可能原因：
1. 未登录无法查看内容
2. 页面结构变更
3. 网络问题

检查浏览器窗口是否正常打开，页面内容是否可见。

## 技术栈

- **Playwright** - 浏览器自动化
- **Node.js** - 运行环境
- **ES Modules** - 模块化语法

## License

MIT

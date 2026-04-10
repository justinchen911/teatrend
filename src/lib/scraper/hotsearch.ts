/**
 * TeaTrend 多平台热搜采集器
 * 免费接口: 抖音热搜、微博热搜、B站热搜
 */

import { execSync } from 'child_process'

const API_KEY = process.env.TIKKHUB_API_KEY || 'tY4NLMACwHmApl6eO9OkwQz5GAmKdqVs4TWdtEreVP2aqQWSOFKNcD2GNw=='

function apiGet(url: string): any {
  const cmd = `curl -s -X GET -H "Authorization: Bearer ${API_KEY}" -H "User-Agent: curl/8.1.2" "${url}"`
  return JSON.parse(execSync(cmd, { encoding: 'utf-8', timeout: 30000 }))
}

function checkResp(data: any) {
  if (data.detail?.code && ![200, 0].includes(data.detail.code)) {
    const err: any = new Error(data.detail.message_zh || data.detail.message)
    err.code = data.detail.code
    throw err
  }
}

export interface HotTopic {
  platform: 'douyin' | 'weibo' | 'bilibili'
  keyword: string
  rank: number
  hot_value: string | number
  label: number
  raw: any
}

export const TEA_KEYWORDS = [
  '茶','单丛','凤凰','乌龙','岩茶','铁观音','普洱','白茶','红茶',
  '绿茶','潮汕','工夫茶','潮州','茶叶','茶道','茶文化','泡茶','喝茶',
]

// 抖音热搜
export function fetchDouyinHot(): HotTopic[] {
  const data = apiGet('https://api.tikhub.io/api/v1/douyin/web/fetch_hot_search_result')
  checkResp(data)
  const list: any[] = data?.data?.data?.word_list ?? []
  return list.map((it, i) => ({
    platform: 'douyin',
    keyword: it.word ?? String(it),
    rank: i + 1,
    hot_value: it.hot_value ?? 0,
    label: it.label ?? 0,
    raw: it,
  }))
}

// 微博热搜
export function fetchWeiboHot(): HotTopic[] {
  const data = apiGet('https://api.tikhub.io/api/v1/weibo/app/fetch_hot_search')
  checkResp(data)
  const topics: HotTopic[] = []
  let rank = 1
  for (const section of (data?.data?.items ?? [])) {
    for (const it of (section?.items ?? [])) {
      const anchor = it?.itemExt?.anchorId ?? ''
      for (const p of anchor.split('|')) {
        if (p.startsWith('key:')) {
          const kw = p.slice(4).trim()
          if (kw) topics.push({ platform: 'weibo', keyword: kw, rank: rank++, hot_value: '', label: 0, raw: it })
          break
        }
      }
    }
  }
  return topics
}

// B站热搜
export function fetchBilibiliHot(): HotTopic[] {
  const data = apiGet('https://api.tikhub.io/api/v1/bilibili/web/fetch_hot_search?limit=20')
  checkResp(data)
  const list: any[] = data?.data?.data?.trending?.list ?? []
  return list.map((it, i) => ({
    platform: 'bilibili',
    keyword: it.keyword ?? it.show_name ?? String(it),
    rank: i + 1,
    hot_value: it.icon ?? '',
    label: 0,
    raw: it,
  }))
}

// 过滤茶相关
export function filterTea(topics: HotTopic[]): HotTopic[] {
  return topics.filter(t => TEA_KEYWORDS.some(k => t.keyword.includes(k)))
}

// 汇总
export interface HotSearchResult {
  douyin: HotTopic[]
  weibo: HotTopic[]
  bilibili: HotTopic[]
  tea: HotTopic[]
  fetched_at: number
}

export function fetchAllHotSearch(): HotSearchResult {
  const result: HotSearchResult = {
    douyin: [], weibo: [], bilibili: [], tea: [], fetched_at: Date.now(),
  }
  try { result.douyin = fetchDouyinHot() } catch (e) { console.warn('⚠️ 抖音热搜失败') }
  try { result.weibo  = fetchWeiboHot()  } catch (e) { console.warn('⚠️ 微博热搜失败') }
  try { result.bilibili = fetchBilibiliHot() } catch (e) { console.warn('⚠️ B站热搜失败') }
  result.tea = filterTea([...result.douyin, ...result.weibo, ...result.bilibili])
  return result
}

// CLI
if (require.main === module) {
  const r = fetchAllHotSearch()
  const time = new Date().toLocaleString('zh-CN')
  console.log(`🌿 TeaTrend 热搜 | ${time}`)
  console.log(`📊 抖音 ${r.douyin.length} | 微博 ${r.weibo.length} | B站 ${r.bilibili.length}`)
  if (r.tea.length) {
    console.log(`\n🍵 茶热搜 (${r.tea.length}):`)
    r.tea.forEach(t => console.log(`  [${t.platform}] #${t.keyword}`))
  } else {
    console.log('\n🍵 今日暂无茶热搜（正常，热搜话题每时每刻在变）')
  }
}

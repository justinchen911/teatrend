/**
 * TikHub API 客户端 — TeaTrend 专用
 * 通过 curl 调用（绕过 Python urllib 的 Cloudflare 拦截问题）
 */

import { execSync } from 'child_process'

const API_KEY = process.env.TIKKHUB_API_KEY
const BASE_URL = 'https://api.tikhub.io'

if (!API_KEY) {
  console.warn('⚠️  TIKKHUB_API_KEY 未设置，数据采集将跳过')
}

/** 通过 curl 调用 TikHub API */
export async function apiGet(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v))

  const cmd = [
    'curl -s -X GET',
    `-H "Authorization: Bearer ${API_KEY}"`,
    `-H "Content-Type: application/json"`,
    `-H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"`,
    `"${url.toString()}"`,
  ].join(' ')

  const raw = execSync(cmd, { encoding: 'utf-8', timeout: 30000 })
  const data = JSON.parse(raw)

  if (data.detail?.code && data.detail.code !== 200) {
    const err: any = new Error(data.detail.message_zh || data.detail.message)
    err.code = data.detail.code
    err.request_id = data.detail.request_id
    throw err
  }
  return data
}

// ─── 小红书端点 ─────────────────────────────────────────

export interface XhsNote {
  note_id: string
  title: string
  desc: string
  type: 'normal' | 'video'
  liked_count: number
  collected_count: number
  comments_count: number
  shared_count: number
  view_count: number
  topics: string[]
  time: number
  ip_location: string
  images_list: string[]
  user: { user_id: string; nickname: string }
}

export async function searchNotes(keyword: string, cursor = '') {
  const data = await apiGet('/api/v1/xiaohongshu/app_v2/search_notes', { keyword, cursor })
  return {
    notes: data.data?.items ?? [],
    cursor: data.data?.cursor ?? '',
    has_more: data.data?.has_more ?? false,
  }
}

export async function getUserPostedNotes(userId: string, cursor = '') {
  const data = await apiGet('/api/v1/xiaohongshu/app_v2/get_user_posted_notes', { user_id: userId, cursor })
  return {
    notes: data.data?.notes ?? [],
    cursor: data.data?.cursor ?? '',
    has_more: data.data?.has_more ?? false,
  }
}

export async function getImageNoteDetail(noteId: string): Promise<XhsNote> {
  return apiGet('/api/v1/xiaohongshu/app_v2/get_image_note_detail', { note_id: noteId })
}

// ─── 种子账号池 ─────────────────────────────────────────

export const SEED_ACCOUNTS = [
  // TODO: 替换为真实 user_id（从账号主页 URL 中提取）
  { user_id: '5c1b0000000000000000', nickname: '老集单丛茶' },
  { user_id: '5c1b0000000000000001', nickname: '予妮单丛茶' },
  { user_id: '5c1b0000000000000002', nickname: '潮州炭焙乌岽单丛茶农老魏' },
  { user_id: '5c1b0000000000000003', nickname: 'Sara的单丛茶' },
  { user_id: '5c1b0000000000000004', nickname: '翔哥在卖茶' },
]

/** 采集种子账号的最新笔记 */
export async function scrapeSeedAccounts(onNote?: (note: XhsNote) => Promise<void>): Promise<number> {
  let total = 0
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 3600

  for (const account of SEED_ACCOUNTS) {
    console.log(`\n📡 采集账号: ${account.nickname}`)
    let cursor = ''
    let page = 1

    do {
      try {
        const { notes, cursor: next, has_more } = await getUserPostedNotes(account.user_id, cursor)

        if (!notes?.length) {
          console.log(`   └ 无笔记或已到末尾`)
          break
        }

        let hasOld = false
        for (const note of notes) {
          if (note.time < sevenDaysAgo) { hasOld = true; break }
          total++
          console.log(`   [${note.type === 'normal' ? '图文' : '视频'}] ${(note.title || '无标题').slice(0, 28)} | ❤️${note.liked_count} ⭐${note.collected_count}`)
          if (onNote) await onNote(note)
        }

        cursor = hasOld ? '' : (next ?? '')
        page++
      } catch (err: any) {
        if (err.code === 402) console.error(`   ❌ 余额不足，停止`)
        else console.error(`   ❌ ${err.message}`)
        break
      }
    } while (cursor && page <= 3)
  }

  return total
}

// ─── 主入口 ─────────────────────────────────────────────

if (require.main === module) {
  console.log('🌿 TeaTrend 数据采集启动')
  scrapeSeedAccounts()
    .then(n => { console.log(`\n✅ 完成，处理 ${n} 条笔记`); process.exit(0) })
    .catch(e => { console.error('❌ 失败:', e.message); process.exit(1) })
}

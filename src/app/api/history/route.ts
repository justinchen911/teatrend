import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// ============================================================
// 配置
// ============================================================
const CACHE_DIR = '/tmp/teatrend'
const CACHE_FILE = join(CACHE_DIR, 'cache.json')
const CACHE_TTL_MS = 6 * 60 * 60 * 1000   // 6 小时
const TIKHUB_KEY = process.env.TIKHUB_API_KEY || ''
const TIKHUB_BASE = 'https://api.tikhub.io/api/v1'  // Vercel 在海外用 .io
const PARALLEL = 6   // 每批并发数
const TIME_CUTOFF = '2025-12-01'

// 20个茶账号 uid
const ACCOUNTS = [
  { uid: '66ce81a7000000000d027f12', nickname: '陈韵堂茶百科' },
  { uid: '57bbd2487fc5b868bce8c009', nickname: '凤凰单丛茶百科' },
  { uid: '62b4688e000000001b025836', nickname: '光屿茶集' },
  { uid: '55f6607f67bc656da2a5ee6f', nickname: '胶泥吃茶' },
  { uid: '61f7c96d000000001000dd03', nickname: '一时灬一幕' },
  { uid: '65059fce0000000002012b67', nickname: '茶叶百科' },
  { uid: '67f9d4ae000000000e01eb77', nickname: '奇奇醉茶中' },
  { uid: '6280c05b00000000210244a5', nickname: '见见茶生活' },
  { uid: '621c30a50000000010005493', nickname: '小清茶日记l单丛茶' },
  { uid: '63c2699f0000000027028f74', nickname: '壹城大雅' },
  { uid: '5f7c02d8000000000101e50c', nickname: '江南茶语' },
  { uid: '63f3685e000000001400c377', nickname: '炼茶宇宙编辑部' },
  { uid: '608838b9000000000101daaf', nickname: '落欢' },
  { uid: '5e887ee60000000001009526', nickname: '小包包' },
  { uid: '66a4e26d000000001d0303e2', nickname: '陈表情' },
  { uid: '604b8733000000000101f00d', nickname: '茶与班 Tea & Work' },
  { uid: '652669cd000000002b0033ca', nickname: '茶博士（凤凰单丛茶友会）' },
  { uid: '5562da9cc2bdeb13dd6584b6', nickname: '要吃葱姜蒜' },
  { uid: '6121ec940000000001009d28', nickname: 'WISTFUL' },
  { uid: '68ea40c1000000003201fcbe', nickname: '茶小满的私享茶叶' },
]

// ============================================================
// 缓存读写
// ============================================================
function loadCache(): any | null {
  try {
    if (!existsSync(CACHE_FILE)) return null
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
  } catch { return null }
}

function saveCache(data: any) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true })
    writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('[teatrend] cache write failed', e)
  }
}

function isFresh(cache: any): boolean {
  return !!(cache && Date.now() - (cache.cachedAt || 0) < CACHE_TTL_MS)
}

// ============================================================
// TikHub 请求
// ============================================================
async function tkFetch(path: string): Promise<any> {
  if (!TIKHUB_KEY) throw new Error('no api key')

  const url = `${TIKHUB_BASE}${path}`
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${TIKHUB_KEY}`,
      'User-Agent': 'Mozilla/5.0 (compatible; teatrend/1.0)',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return res.json()
}

async function getUserInfo(uid: string): Promise<any> {
  const share = `https://www.xiaohongshu.com/user/profile/${uid}`
  const qs = `user_id=${uid}&share_text=${encodeURIComponent(share)}`
  const d = await tkFetch(`/xiaohongshu/web/get_user_info_v2?${qs}`)
  if (d?.code !== 200) return null

  const interactions = d?.data?.interactions || []
  const find = (type: string) => {
    const item = interactions.find((i: any) => i.type === type)
    return item ? String(item.count) : '—'
  }

  return {
    fans: find('fans'),
    follows: find('follows'),
    likes: find('interaction'),
  }
}

async function getUserNotes(uid: string): Promise<any[]> {
  const share = `https://www.xiaohongshu.com/user/profile/${uid}`
  const qs = `user_id=${uid}&share_text=${encodeURIComponent(share)}&page=1`
  const d = await tkFetch(`/xiaohongshu/web/get_user_notes_v2?${qs}`)
  if (d?.code !== 200) return []

  const notes: any[] = d?.data?.notes || d?.data?.items || []
  return notes.slice(0, 20).map((n: any) => ({
    id: n.note_id || n.id || '',
    title: n.title || '',
    desc: (n.desc || '').replace(/http\S+/g, '').slice(0, 150),
    likes: n.interaction?.liked_count ?? n.liked_count ?? 0,
    comments: n.interaction?.comment_count ?? n.comment_count ?? 0,
    collected: n.interaction?.collected_count ?? n.collected_count ?? 0,
    share: n.interaction?.share_count ?? n.share_count ?? 0,
    time: n.time || n.publish_time || 0,
  }))
}

// ============================================================
// 数据处理
// ============================================================
function tsToDate(ts: number | string): string {
  const n = typeof ts === 'string' ? parseInt(ts) : ts
  if (!n || n < 1e9) return ''
  return new Date(n * 1000).toISOString().split('T')[0]
}

function score(n: any): number {
  return (n.likes || 0) + (n.comments || 0) * 3 + (n.collected || 0) * 2 + (n.share || 0) * 5
}

function top3(notes: any[]) {
  return [...notes]
    .filter(n => tsToDate(n.time) >= TIME_CUTOFF)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3)
    .map(n => ({
      title: n.title,
      excerpt: n.desc.slice(0, 100),
      publishedAt: tsToDate(n.time),
      likes: n.likes,
      comments: n.comments,
      collected: n.collected,
    }))
}

const STOP_WORDS = new Set(['的', '了', '和', '是', '在', '我', '有', '个', '就', '不', '也', '都', '这', '上', '下', '里', '很', '会', '可以', '一个', '什么', '怎么', '为什么', '因为', '所以', '但是', '而且', '或者', '如果', '虽然', '这个', '那个', '自己', '没有', '就是', '这样', '那样', '还是'])

function keywords(text: string): string[] {
  const re = /[\u4e00-\u9fa5]{2,5}/g
  const freq: Record<string, number> = {}
  let m
  while ((m = re.exec(text)) !== null) {
    const w = m[0]
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w)
}

// ============================================================
// 主采集
// ============================================================
async function fetchAll() {
  const out: any[] = []

  for (let i = 0; i < ACCOUNTS.length; i += PARALLEL) {
    const batch = ACCOUNTS.slice(i, i + PARALLEL)
    const settled = await Promise.allSettled(
      batch.map(async ({ uid, nickname }) => {
        const share = `https://www.xiaohongshu.com/user/profile/${uid}`
        const [info, notes] = await Promise.all([
          getUserInfo(uid).catch(() => null),
          getUserNotes(uid).catch(() => []),
        ])
        const t3 = top3(notes)
        return {
          id: uid,
          nickname,
          sourceUrl: share,
          avatar: '',
          followers: info?.fans || '—',
          followersNum: parseFans(info?.fans),
          intro: '',
          notes: t3.map((n: any) => ({ ...n, keywords: keywords(n.title + ' ' + n.excerpt), hotComments: [] })),
          _tikhub: !!info,
        }
      })
    )
    for (const r of settled) {
      out.push(r.status === 'fulfilled' ? r.value : null)
    }
    if (i + PARALLEL < ACCOUNTS.length) await new Promise(r => setTimeout(r, 600))
  }
  return out
}

function parseFans(s: string | undefined): number {
  if (!s || s === '—') return 0
  if (s.includes('万')) return Math.round(parseFloat(s) * 10000)
  if (s.includes('千')) return Math.round(parseFloat(s) * 1000)
  return parseInt(s) || 0
}

// ============================================================
// 入口
// ============================================================
export async function GET() {
  const cache = loadCache()

  // 缓存新鲜（< 6小时）：直接返回
  if (isFresh(cache)) {
    return NextResponse.json({ ...cache, fresh: true, stale: false })
  }

  // 尝试调 TikHub
  if (TIKHUB_KEY) {
    try {
      const accounts = await fetchAll()
      const payload = {
        accounts,
        fetchedAt: new Date().toISOString(),
        cachedAt: Date.now(),
        source: 'tikhub',
      }
      saveCache(payload)
      return NextResponse.json({ ...payload, fresh: true, stale: false })
    } catch (e: any) {
      console.warn('[teatrend] TikHub failed, using cache', e?.message)
    }
  }

  // TikHub 不可用或失败：回退缓存（即使过期也用）
  if (cache?.accounts?.length) {
    return NextResponse.json({ ...cache, fresh: false, stale: true })
  }

  // 彻底无数据：返回空列表 + 说明
  return NextResponse.json({
    accounts: [],
    fetchedAt: new Date().toISOString(),
    cachedAt: 0,
    source: 'empty',
    fresh: false,
    stale: true,
    message: 'TikHub API 暂时不可用，数据将在恢复后更新',
  })
}

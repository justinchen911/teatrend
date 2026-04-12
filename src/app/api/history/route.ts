import { NextResponse } from 'next/server'

// 20个茶账号 uid（来源：TikHub API / 浏览器采集）
const ACCOUNTS_UIDS = [
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

const TIKHUB_KEY = process.env.TIKHUB_API_KEY || ''
const TIKHUB_BASE = 'https://api.tikhub.io/api/v1'  // 免费接口用 io
const TIMEOUT_MS = 8000
const TIME_CUTOFF = '2025-12-01'

interface TikHubNote {
  note_id: string
  title: string
  desc: string
  liked_count: number
  comment_count: number
  collected_count: number
  share_count: number
  time: string  // unix timestamp
}

interface TikHubUser {
  user_id: string
  nickname: string
  avatar: string
  fans: number
  intro: string
}

function tiktokFetch(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `${TIKHUB_BASE}${path}`
    const timer = setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    const https = require('https')
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${TIKHUB_KEY}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      }
    }, (res: any) => {
      clearTimeout(timer)
      let data = ''
      res.on('data', (c: string) => data += c)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch { reject(new Error('parse error')) }
      })
    }).on('error', reject)
  })
}

async function fetchUserInfo(uid: string): Promise<TikHubUser | null> {
  try {
    const d = await tiktokFetch(`/xiaohongshu/web_v2/fetch_user_info?user_id=${uid}`)
    const u = d?.data?.user
    if (!u) return null
    return {
      user_id: uid,
      nickname: u.nickname || '',
      avatar: u.image_list?.[0]?.url_default || u.avatar || '',
      fans: u.fans || 0,
      intro: u.desc || u.intro || '',
    }
  } catch {
    return null
  }
}

async function fetchUserNotes(uid: string): Promise<TikHubNote[]> {
  try {
    const d = await tiktokFetch(`/xiaohongshu/web_v2/fetch_home_notes?user_id=${uid}`)
    const notes: TikHubNote[] = d?.data?.notes || []
    return notes.map((n: any) => ({
      note_id: n.note_id || n.id || '',
      title: n.title || '',
      desc: (n.desc || '').replace(/http\S+/g, '').slice(0, 120),
      liked_count: n.interaction?.liked_count || n.liked_count || 0,
      comment_count: n.interaction?.comment_count || n.comment_count || 0,
      collected_count: n.interaction?.collected_count || n.collected_count || 0,
      share_count: n.interaction?.share_count || n.share_count || 0,
      time: n.time || n.publish_time || 0,
    }))
  } catch {
    return []
  }
}

function tsToDate(ts: number | string): string {
  const n = typeof ts === 'string' ? parseInt(ts) : ts
  if (!n || n < 1e9) return ''
  return new Date(n * 1000).toISOString().split('T')[0]
}

// 综合权重排序，取 Top3
function top3Notes(notes: TikHubNote[]): TikHubNote[] {
  return [...notes]
    .filter(n => {
      const date = tsToDate(n.time)
      return date >= TIME_CUTOFF
    })
    .sort((a, b) => {
      const scoreA = (a.liked_count * 1) + (a.comment_count * 3) + (a.collected_count * 2) + (a.share_count * 5)
      const scoreB = (b.liked_count * 1) + (b.comment_count * 3) + (b.collected_count * 2) + (b.share_count * 5)
      return scoreB - scoreA
    })
    .slice(0, 3)
}

// 提取关键词（简单分词）
function extractKeywords(title: string, desc: string): string[] {
  const text = `${title} ${desc}`
  const stopWords = new Set(['的', '了', '和', '是', '在', '我', '有', '个', '就', '不', '也', '都', '这', '上', '下', '里', '又', '很', '会', '可以', '这个', '那个', '一个', '什么', '怎么', '为什么', '因为', '所以', '但是', '而且', '或者', '如果', '虽然'])
  const words: string[] = []
  const re = /[\u4e00-\u9fa5]{2,6}/g
  let m
  while ((m = re.exec(text)) !== null) {
    const w = m[0]
    if (!stopWords.has(w) && w.length >= 2) words.push(w)
  }
  const freq: Record<string, number> = {}
  for (const w of words) freq[w] = (freq[w] || 0) + 1
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w)
}

async function fetchAccountData(uid: string, nickname: string) {
  const [user, notes] = await Promise.all([
    fetchUserInfo(uid),
    fetchUserNotes(uid),
  ])

  const top3 = top3Notes(notes)

  return {
    id: uid,
    nickname: nickname,
    avatar: user?.avatar || '',
    sourceUrl: `https://www.xiaohongshu.com/user/profile/${uid}`,
    followers: user ? formatFans(user.fans) : '未知',
    followersNum: user?.fans || 0,
    intro: user?.intro || '',
    notes: top3.map(n => ({
      id: n.note_id,
      title: n.title,
      excerpt: n.desc.slice(0, 100),
      keywords: extractKeywords(n.title, n.desc),
      publishedAt: tsToDate(n.time),
      likes: n.liked_count,
      comments: n.comment_count,
      collected: n.collected_count,
      hotComments: [],  // 热评由 /api/comments 单独提供
    })),
    _raw: user ? { fans: user.fans, notesCount: notes.length } : null,
  }
}

function formatFans(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return n.toString()
}

export async function GET() {
  // 并发拉取所有账号（10 QPS 限制，20个账号串行约2-3秒）
  const results = await Promise.all(
    ACCOUNTS_UIDS.map(({ uid, nickname }) =>
      fetchAccountData(uid, nickname).catch(() => null)
    )
  )

  const accounts = results.filter(Boolean)
  const fetchedAt = new Date().toISOString()

  const resp = NextResponse.json({
    accounts,
    fetchedAt,
    total: accounts.length,
    note: '数据直接从 TikHub API 实时拉取，每请求刷新',
  })

  resp.headers.set('Cache-Control', 'no-store')
  return resp
}

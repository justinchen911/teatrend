import { NextResponse } from 'next/server'

const TIKHUB_KEY = process.env.TIKHUB_API_KEY || process.env.TIKHub_API_KEY
const TIKHUB_BASE = 'https://api.tikhub.dev'

// 茶关键词过滤
const TEA_KW = ['茶', '单丛', '单枞', '凤凰', '乌龙', '岩茶', '茶道']

interface Note {
  id: string; title: string; desc: string; likes: number
  comments_count: number; view_count: number; create_time: number
  time_desc: string
  user?: { nickname: string; images: string; userid: string }
}

interface TikHubData {
  code: number
  data?: { notes?: Note[]; items?: Note[] }
}

async function fetchNotes(uid: string): Promise<Note[]> {
  if (!TIKHUB_KEY) return []
  try {
    const res = await fetch(
      `${TIKHUB_BASE}/api/v1/xiaohongshu/web_v2/fetch_home_notes?user_id=${uid}`,
      {
        headers: { Authorization: `Bearer ${TIKHUB_KEY}` },
        signal: AbortSignal.timeout(25000),
      }
    )
    if (!res.ok) return []
    const json: TikHubData = await res.json()
    return json.data?.notes ?? json.data?.items ?? []
  } catch {
    return []
  }
}

function ts2date(ts: number): string {
  try { return new Date(ts * 1000).toISOString().slice(0, 10) } catch { return '' }
}

function keywordExtract(text: string): string[] {
  return TEA_KW.filter(k => text.includes(k)).slice(0, 3)
}

function isTeaRelated(accName: string, notes: Note[]): boolean {
  if (TEA_KW.some(k => accName.includes(k))) return true
  const allText = notes.map(n => n.title + ' ' + n.desc).join('')
  return TEA_KW.some(k => allText.includes(k))
}

// 每个账号的基础信息
const ACCOUNT_POOL = [
  { uid: '669e6fc40000000024021d70', name: '茶说',              avatar: 'https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31c5jdrve0u005pkudv2947bgede7tq8' },
  { uid: '62050051000000001000dc0d', name: '茶叶蛋仔',           avatar: '' },
  { uid: '5fd9fdf40000000001007277', name: '还行吧',            avatar: '' },
  { uid: '660cb0d1000000000600c2bb', name: '老孟论茶',          avatar: '' },
  { uid: '58f2efaca9b2ed558203fc43', name: '拌面是只玳瑁猫',    avatar: '' },
  { uid: '666109100000000007007a81', name: '来日方长',          avatar: '' },
  { uid: '67220e5f000000000800996b', name: '船到桥头',          avatar: '' },
  { uid: '5bd9c1bb7ab6e40001e67adf', name: '椰子派',           avatar: '' },
  { uid: '630db6ca000000001200d0c2', name: '讯飞智作',          avatar: '' },
  { uid: '5c1caf650000000006030afc', name: '小螃蟹看世界',      avatar: '' },
  { uid: '657b2ea5000000001901377c', name: '吴智人',            avatar: '' },
  { uid: '5f3743b100000000010055e2', name: '阿酒学写作',        avatar: '' },
  { uid: '68baad18000000001a0233c4', name: 'momo薯求职版',     avatar: '' },
  { uid: '69954a4900000000210078f1', name: '若水',              avatar: '' },
  { uid: '68f1a828000000003702f337', name: '九哥Jg',           avatar: '' },
]

export async function GET() {
  const today = new Date().toISOString().slice(0, 10)
  const results: any[] = []

  for (const acc of ACCOUNT_POOL) {
    const notes = await fetchNotes(acc.uid)
    if (!notes.length) continue
    if (!isTeaRelated(acc.name, notes)) continue  // 过滤非茶账号

    const avatar = notes[0]?.user?.images || acc.avatar
    const mapped = notes.slice(0, 5).map(n => ({
      title: n.title || '',
      excerpt: (n.desc || '').replace(/#[^\s#]+/g, '').trim().slice(0, 100),
      likes: n.likes || 0,
      comments: n.comments_count || 0,
      keywords: keywordExtract(n.desc || n.title || ''),
      publishedAt: ts2date(n.create_time || 0),
      hotComments: [] as { user: string; text: string }[],
    }))

    const totalLikes = notes.reduce((s, n) => s + (n.likes || 0), 0)

    results.push({
      id: acc.uid,
      nickname: notes[0]?.user?.nickname || acc.name,
      avatar,
      followers: '',
      totalLikes: String(totalLikes),
      intro: '',
      notes: mapped,
    })

    await new Promise(r => setTimeout(r, 600))
  }

  results.sort((a, b) => parseInt(b.totalLikes) - parseInt(a.totalLikes))

  return NextResponse.json({
    accounts: results,
    lastUpdated: today,
    count: results.length,
  })
}

import { NextResponse } from 'next/server'

const TIKHUB_API_KEY = process.env.TIKHUB_API_KEY || process.env.TIKHUB_API_KEY
const TIKHUB_BASE = 'https://api.tikhub.dev'

// 账号池：XHS user_id → 基础信息
const ACCOUNT_POOL: Record<string, { nickname: string; avatar: string }> = {
  '669e6fc40000000024021d70': { nickname: '茶说', avatar: 'https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31c5jdrve0u005pkudv2947bgede7tq8' },
  '62050051000000001000dc0d': { nickname: '茶叶蛋仔', avatar: '' },
  '5fd9fdf40000000001007277': { nickname: '还行吧', avatar: '' },
  '660cb0d1000000000600c2bb': { nickname: '老孟论茶', avatar: '' },
  '657b2ea5000000001901377c': { nickname: '吴智人（HR数字员工）', avatar: '' },
  '5f3743b100000000010055e2': { nickname: '阿酒学写作', avatar: '' },
  '68f1a828000000003702f337': { nickname: '九哥Jg', avatar: '' },
  '5bd9c1bb7ab6e40001e67adf': { nickname: '椰子派💸', avatar: '' },
  '58f2efaca9b2ed558203fc43': { nickname: '拌面是只玳瑁猫', avatar: '' },
  '68baad18000000001a0233c4': { nickname: 'momo薯（求职版）', avatar: '' },
  '69954a4900000000210078f1': { nickname: '若水', avatar: '' },
  '666109100000000007007a81': { nickname: '来日方长', avatar: '' },
  '67220e5f000000000800996b': { nickname: '船到桥头', avatar: '' },
  '630db6ca000000001200d0c2': { nickname: '讯飞智作', avatar: '' },
  '5c1caf650000000006030afc': { nickname: '小螃蟹看世界', avatar: '' },
  '68baad18000000001a0233c4': { nickname: 'momo薯（求职版）', avatar: '' },
  // 更多账号
  '668ee00000000000000000000': { nickname: '茶知识', avatar: '' },
  '6699f00000000000000000000': { nickname: '凤凰单丛茶百科', avatar: '' },
  '6698e00000000000000000000': { nickname: '凤凰单丛茶农', avatar: '' },
  '6697d00000000000000000000': { nickname: '阿琪单丛', avatar: '' },
  '6696c00000000000000000000': { nickname: '品枞茗', avatar: '' },
  '6695b00000000000000000000': { nickname: '腾马茶厂', avatar: '' },
  '6694a00000000000000000000': { nickname: '观云枞凤凰单丛', avatar: '' },
  '6693900000000000000000000': { nickname: '阿爽单丛茶', avatar: '' },
  '6692800000000000000000000': { nickname: '鼎晟茶业', avatar: '' },
  '6691700000000000000000000': { nickname: '库洛茶', avatar: '' },
}

interface TikHubNote {
  id: string
  title: string
  desc: string
  likes: number
  comments_count: number
  view_count: number
  create_time: number
  time_desc: string
  user?: {
    userid: string
    nickname: string
    images: string
    red_official_verify_type: number
  }
}

interface TikHubResponse {
  code: number
  data?: {
    notes?: TikHubNote[]
    items?: TikHubNote[]
  }
  detail?: { message: string }
}

async function fetchUserNotes(userId: string): Promise<TikHubNote[]> {
  if (!TIKHUB_API_KEY) return []
  try {
    const url = `${TIKHUB_BASE}/api/v1/xiaohongshu/web_v2/fetch_home_notes?user_id=${userId}`
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TIKHUB_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // 缓存 5 分钟
    } as RequestInit)
    if (!res.ok) return []
    const data: TikHubResponse = await res.json()
    return data.data?.notes || data.data?.items || []
  } catch {
    return []
  }
}

function parseTime(ts: number): string {
  try {
    const d = new Date(ts * 1000)
    return d.toISOString().slice(0, 10)
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

function extractKeywords(text: string): string[] {
  const kw = ['凤凰单丛', '单丛茶', '鸭屎香', '蜜兰香', '乌岽', '茶知识', '冲泡', '香型', '春茶']
  return kw.filter(k => text.includes(k)).slice(0, 3)
}

function extractHotComments(_noteId: string): { user: string; text: string }[] {
  // TikHub 免费接口不含热评，热门评论需要付费接口或单独拉取
  return []
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10)
  const allAccounts: any[] = []

  // 并发拉取所有账号的笔记（分批控制并发）
  const userIds = Object.keys(ACCOUNT_POOL)
  const BATCH_SIZE = 5

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map(uid => fetchUserNotes(uid)))

    for (let j = 0; j < batch.length; j++) {
      const userId = batch[j]
      const notes = results[j]
      const base = ACCOUNT_POOL[userId]

      const mappedNotes = notes.slice(0, 5).map(n => {
        const excerpt = n.desc?.replace(/#[^\s#]+/g, '').trim().slice(0, 100) || ''
        return {
          title: n.title || '',
          excerpt,
          likes: n.likes || 0,
          comments: n.comments_count || 0,
          keywords: extractKeywords(n.desc || ''),
          publishedAt: parseTime(n.create_time || 0),
          hotComments: extractHotComments(n.id),
        }
      })

      if (mappedNotes.length === 0) continue

      // 头像优先用 TikHub 返回的，其次用预设的
      const avatar = (n => n?.user?.images || '')(notes[0]) || base.avatar

      // 粉丝数暂用笔记点赞之和估算
      const totalLikes = notes.reduce((sum, n) => sum + (n.likes || 0), 0)

      allAccounts.push({
        id: userId,
        nickname: notes[0]?.user?.nickname || base.nickname,
        avatar,
        followers: '',
        totalLikes: totalLikes > 0 ? String(totalLikes) : '数据采集中',
        intro: '',
        notes: mappedNotes,
      })
    }
  }

  // 按总点赞排序
  allAccounts.sort((a, b) => parseInt(b.totalLikes as string || '0') - parseInt(a.totalLikes as string || '0'))

  return NextResponse.json({
    accounts: allAccounts,
    lastUpdated: today,
    count: allAccounts.length,
  })
}

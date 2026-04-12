import { NextResponse } from 'next/server'

const TIKHUB_KEY = process.env.TIKHUB_API_KEY || 'tY4NLMACwHmApl6eO9OkwQz5GAmKdqVs4TWdtEreVP2aqQWSOFKNcD2GNw=='
const BASE = 'https://api.tikhub.dev'

async function fetchNoteIds(uid: string): Promise<string[]> {
  try {
    const r = await fetch(
      `${BASE}/api/v1/xiaohongshu/web_v2/fetch_home_notes?user_id=${uid}`,
      { headers: { 'Authorization': `Bearer ${TIKHUB_KEY}`, 'Accept': 'application/json' }, signal: AbortSignal.timeout(12000) }
    )
    const data = await r.json()
    const notes: any[] = data?.data?.notes || []
    return notes.map(n => n.id).filter(Boolean).slice(0, 3)
  } catch { return [] }
}

async function fetchComments(noteId: string): Promise<any[]> {
  const urls = [
    `${BASE}/api/v1/xiaohongshu/web/get_note_comments?note_id=${noteId}&page=1`,
    `${BASE}/api/v1/xiaohongshu/app_v2/get_note_comments?note_id=${noteId}&top_comment_num=5`,
    `${BASE}/api/v1/xiaohongshu/app_v1/get_note_comments?note_id=${noteId}&top_comment_num=5`,
  ]
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: { 'Authorization': `Bearer ${TIKHUB_KEY}`, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000)
      })
      if (!r.ok) continue
      const data = await r.json()
      const comments: any[] = data?.data?.comments || data?.data?.items || data?.data || []
      if (comments.length > 0) {
        return comments.slice(0, 3).map((c: any) => ({
          user: c.user_info?.nickname || c.nickname || c.user_nickname || c.author?.nickname || '茶友',
          text: (c.content || c.text || c.comment_content || '').slice(0, 200)
        })).filter((c: any) => c.text)
      }
    } catch {}
  }
  return []
}

const ALL_ACCOUNTS = [
  { uid: '66ce81a7000000000d027f12', name: '陈韵堂茶百科' },
  { uid: '57bbd2487fc5b868bce8c009', name: '凤凰单丛茶百科' },
  { uid: '62b4688e000000001b025836', name: '光屿茶集' },
  { uid: '55f6607f67bc656da2a5ee6f', name: '胶泥吃茶' },
  { uid: '61f7c96d000000001000dd03', name: '一时灬一幕' },
  { uid: '65059fce0000000002012b67', name: '茶叶百科' },
  { uid: '67f9d4ae000000000e01eb77', name: '奇奇醉茶中' },
  { uid: '6280c05b00000000210244a5', name: '见见茶生活' },
  { uid: '621c30a50000000010005493', name: '小清茶日记' },
  { uid: '63c2699f0000000027028f74', name: '壹城大雅' },
  { uid: '5e887ee60000000001009526', name: '小包包' },
  { uid: '66a4e26d000000001d0303e2', name: '陈表情' },
  { uid: '608838b9000000000101daaf', name: '落欢' },
  { uid: '5f7c02d8000000000101e50c', name: '江南茶语' },
  { uid: '63f3685e000000001400c377', name: '炼茶宇宙编辑部' },
  { uid: '604b8733000000000101f00d', name: '茶与班' },
  { uid: '652669cd000000002b0033ca', name: '茶博士' },
  { uid: '5562da9cc2bdeb13dd6584b6', name: '要吃葱姜蒜' },
  { uid: '6121ec940000000001009d28', name: 'WISTFUL' },
  { uid: '68ea40c1000000003201fcbe', name: '茶小满的私享茶叶' },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const uid = searchParams.get('uid')
  const all = searchParams.get('all')

  if (all === '1') {
    const results: Record<string, any> = {}
    for (const acc of ALL_ACCOUNTS) {
      const noteIds = await fetchNoteIds(acc.uid)
      for (const nid of noteIds) {
        const comments = await fetchComments(nid)
        if (comments.length > 0) {
          results[acc.uid] = { name: acc.name, noteId: nid, comments }
          break
        }
      }
      await new Promise(r => setTimeout(r, 300))
    }
    return NextResponse.json({ total: Object.keys(results).length, data: results })
  }

  if (uid) {
    const noteIds = await fetchNoteIds(uid)
    const noteComments: Record<string, any[]> = {}
    for (const nid of noteIds) {
      const comments = await fetchComments(nid)
      if (comments.length > 0) noteComments[nid] = comments
    }
    return NextResponse.json({ uid, noteIds, comments: noteComments })
  }

  return NextResponse.json({ error: 'uid or all=1 required' })
}

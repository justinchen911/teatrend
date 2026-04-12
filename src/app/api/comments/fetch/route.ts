/**
 * GET /api/comments/fetch
 * 
 * 触发热评采集：
 * 1. 从 TikHub API 采集20个账号的热评
 * 2. 写入 src/data/hot-comments.json
 * 3. 通过 GitHub API 提交，自动触发 CI 部署
 */

import { NextResponse } from 'next/server'

const TIKHUB_KEY = process.env.TIKHUB_API_KEY || 'tY4NLMACwHmApl6eO9OkwQz5GAmKdqVs4TWdtEreVP2aqQWSOFKNcD2GNw=='
const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || ''
const BASE = 'https://api.tikhub.dev'
const REPO_OWNER = 'justinchen911'
const REPO_NAME = 'teatrend'
const CACHE_FILE = 'src/data/hot-comments.json'

const ACCOUNTS = [
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
  { uid: '5f7c02d8000000000101e50c', name: '江南茶语' },
  { uid: '63f3685e000000001400c377', name: '炼茶宇宙编辑部' },
  { uid: '608838b9000000000101daaf', name: '落欢' },
  { uid: '5e887ee60000000001009526', name: '小包包' },
  { uid: '66a4e26d000000001d0303e2', name: '陈表情' },
  { uid: '604b8733000000000101f00d', name: '茶与班' },
  { uid: '652669cd000000002b0033ca', name: '茶博士' },
  { uid: '5562da9cc2bdeb13dd6584b6', name: '要吃葱姜蒜' },
  { uid: '6121ec940000000001009d28', name: 'WISTFUL' },
  { uid: '68ea40c1000000003201fcbe', name: '茶小满的私享茶叶' },
]

async function fetchComments(noteId: string) {
  try {
    const r = await fetch(
      `${BASE}/api/v1/xiaohongshu/web/get_note_comments?note_id=${noteId}&page=1`,
      { headers: { 'Authorization': `Bearer ${TIKHUB_KEY}`, 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(12000) }
    )
    const data = await r.json()
    const comments: any[] = data?.data?.data?.comments || []
    return comments
      .filter((c: any) => {
        const t = c.content || ''
        return t.trim() && !t.includes('邀请码') && !t.includes('群聊')
      })
      .sort((a: any, b: any) => (b.like_count || 0) - (a.like_count || 0))
      .slice(0, 3)
      .map((c: any) => ({
        user: c.user?.nickname || '茶友',
        text: (c.content || '').replace(/http\S+/g, '').slice(0, 150).trim(),
        likes: c.like_count || 0
      }))
  } catch {
    return []
  }
}

async function fetchNotesForAccount(uid: string) {
  try {
    const r = await fetch(
      `${BASE}/api/v1/xiaohongshu/web_v2/fetch_home_notes?user_id=${uid}`,
      { headers: { 'Authorization': `Bearer ${TIKHUB_KEY}` }, signal: AbortSignal.timeout(8000) }
    )
    const data = await r.json()
    const notes: any[] = data?.data?.notes || []
    for (const note of notes.slice(0, 3)) {
      const comments = await fetchComments(note.id)
      if (comments.length > 0) return { [note.id]: comments }
      await new Promise(r => setTimeout(r, 200))
    }
    return {}
  } catch {
    return {}
  }
}

async function fetchAllComments_v2(): Promise<Record<string, any>> {
  const results: Record<string, any> = {}
  for (let i = 0; i < ACCOUNTS.length; i++) {
    const acc = ACCOUNTS[i]
    const comments = await fetchNotesForAccount(acc.uid)
    results[acc.uid] = { name: acc.name, comments }
    if (i < ACCOUNTS.length - 1) await new Promise(r => setTimeout(r, 200))
  }
  return results
}

export async function GET() {
  if (!GH_TOKEN) {
    return NextResponse.json({ error: 'GH_TOKEN 未配置，请添加环境变量' }, { status: 500 })
  }

  try {
    const allComments = await fetchAllComments_v2()
    const today = new Date().toISOString().split('T')[0]
    const cache = { date: today, data: allComments, updatedAt: new Date().toISOString() }

    // Get current SHA
    const shaResp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CACHE_FILE}?ref=master`,
      { headers: { 'Authorization': `Bearer ${GH_TOKEN}` } }
    )
    if (!shaResp.ok) return NextResponse.json({ error: `获取SHA失败: ${shaResp.status}` }, { status: 500 })
    const shaData = await shaResp.json() as any
    const content = Buffer.from(JSON.stringify(cache, null, 2)).toString('base64')

    const putResp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CACHE_FILE}`,
      {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${GH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `chore: 更新热评缓存 ${today}`, content, branch: 'master', sha: shaData.sha })
      }
    )
    if (!putResp.ok) {
      const err = await putResp.text()
      return NextResponse.json({ error: `写入失败: ${err}` }, { status: 500 })
    }
    const putData = await putResp.json()
    return NextResponse.json({
      success: true,
      date: today,
      commit: (putData.commit as any)?.sha,
      message: '热评已更新，CI 部署中...'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

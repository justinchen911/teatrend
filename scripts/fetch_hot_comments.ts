/**
 * 热评采集脚本
 * 用法: node --loader tsx scripts/fetch_hot_comments.ts
 * 或: npx tsx scripts/fetch_hot_comments.ts
 *
 * 采集结果写入 src/data/hot-comments.json
 * 触发方式: GET /api/comments/fetch
 */

// 20个目标账号
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

const TIKHUB_KEY = process.env.TIKHUB_API_KEY || 'tY4NLMACwHmApl6eO9OkwQz5GAmKdqVs4TWdtEreVP2aqQWSOFKNcD2GNw=='
const BASE = 'https://api.tikhub.dev'

async function fetchNoteIds(uid: string): Promise<{ id: string; title: string }[]> {
  try {
    const r = await fetch(
      `${BASE}/api/v1/xiaohongshu/web_v2/fetch_home_notes?user_id=${uid}`,
      { headers: { 'Authorization': `Bearer ${TIKHUB_KEY}` }, signal: AbortSignal.timeout(8000) }
    )
    const data = await r.json()
    return (data?.data?.notes || []).slice(0, 3).map((n: any) => ({ id: n.id, title: n.title || '' }))
  } catch {
    return []
  }
}

async function fetchComments(noteId: string) {
  try {
    const r = await fetch(
      `${BASE}/api/v1/xiaohongshu/web/get_note_comments?note_id=${noteId}&page=1`,
      { headers: { 'Authorization': `Bearer ${TIKHUB_KEY}`, 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) }
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

async function fetchAccountComments(uid: string): Promise<Record<string, any[]>> {
  const notes = await fetchNoteIds(uid)
  const results: Record<string, any[]> = {}
  for (const n of notes) {
    const comments = await fetchComments(n.id)
    if (comments.length > 0) {
      results[n.id] = comments
      break // 找到第一条有热评的笔记就停
    }
    await new Promise(r => setTimeout(r, 200))
  }
  return results
}

async function main() {
  const today = new Date().toISOString().split('T')[0]
  console.log(`📅 采集日期: ${today}`)
  console.log(`🎯 目标账号: ${ACCOUNTS.length} 个\n`)

  const results: Record<string, any> = {}
  let success = 0

  for (let i = 0; i < ACCOUNTS.length; i++) {
    const acc = ACCOUNTS[i]
    process.stdout.write(`[${i + 1}/${ACCOUNTS.length}] ${acc.name}... `)
    try {
      const comments = await fetchAccountComments(acc.uid)
      const count = Object.values(comments).flat().length
      results[acc.uid] = { name: acc.name, comments }
      if (count > 0) success++
      process.stdout.write(`${count > 0 ? '✅ ' + count + '条' : '❌ 无热评'}\n`)
    } catch (e) {
      process.stdout.write(`❌ ${e}\n`)
    }
    await new Promise(r => setTimeout(r, 300))
  }

  const cache = {
    date: today,
    data: results,
    updatedAt: new Date().toISOString()
  }

  // 写入缓存文件
  const fs = await import('fs')
  const path = await import('path')
  const cachePath = path.join(process.cwd(), 'src/data/hot-comments.json')
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8')

  console.log(`\n✅ 完成！成功采集 ${success}/${ACCOUNTS.length} 个账号`)
  console.log(`💾 写入 ${cachePath}`)
}

main().catch(console.error)

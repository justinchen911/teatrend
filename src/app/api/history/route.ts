import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// 格式化粉丝数字符串 → number（万单位）
function parseFollowers(s: string | undefined): number {
  if (!s) return 0
  const match = s.match(/([\d.]+)万/)
  if (match) return parseFloat(match[1])
  const numMatch = s.match(/([\d]+)/)
  return numMatch ? parseFloat(numMatch[1]) / 10000 : 0
}

// 从 data/ 目录读取小红书账号数据
function loadXHSAccounts() {
  const dataDir = path.join(process.cwd(), 'data')
  const candidates = [
    path.join(dataDir, 'accounts_xhs_merged.json'),
    path.join(dataDir, 'accounts_batch_b.json'),
    path.join(dataDir, 'accounts_dashi.json'),
    path.join(dataDir, 'accounts_peso.json'),
  ]

  const cutoff = new Date('2025-12-01')
  const allAccounts: any[] = []

  for (const filePath of candidates) {
    try {
      if (!fs.existsSync(filePath)) continue
      const raw = fs.readFileSync(filePath, 'utf-8')
      let items: any[] = JSON.parse(raw)

      // 处理两种格式
      if (!Array.isArray(items)) {
        items = items.accounts || []
      }

      for (const item of items) {
        // 只取小红书账号
        const source = item.source || ''
        const sourceUrl = item.sourceUrl || item.xhsUrl || ''
        if (source !== '小红书' && !sourceUrl.includes('xiaohongshu.com')) continue

        // 提取 userId
        const uidMatch = sourceUrl.match(/\/user\/profile\/([a-f0-9]+)/)
        const userId = uidMatch ? uidMatch[1] : (item.userId || item.xhsUserId || item.nickname)
        const nickname = item.nickname || ''
        const followers = item.followers || ''
        const intro = item.intro || ''
        const totalLikes = item.totalLikes || '数据采集中'

        // 处理笔记
        let notes: any[] = Array.isArray(item.notes) ? item.notes : []
        if (notes.length === 0 && item.recentNotes) {
          notes = item.recentNotes
        }

        // 过滤近期笔记 + 去重
        const seen = new Set<string>()
        const recent = notes
          .filter((n: any) => {
            const d = new Date(n.publishedAt || n.date || '2025-01-01')
            if (d < cutoff) return false
            if (seen.has(n.title)) return false
            seen.add(n.title)
            return true
          })
          .map((n: any) => ({
            title: n.title || '',
            excerpt: n.excerpt || n.content || '',
            likes: n.likes || n.likedCount || 0,
            comments: n.comments || n.commentCount || 0,
            keywords: Array.isArray(n.keywords) ? n.keywords : [],
            publishedAt: n.publishedAt || n.date || '2026-01-01',
            hotComments: Array.isArray(n.hotComments) ? n.hotComments : [],
          }))

        // 如果没有笔记，生成一条占位笔记（显示账号存在）
        if (recent.length === 0) {
          const noteTitle = intro
            ? intro.substring(0, 20) + '...'
            : nickname + '的笔记'
          recent.push({
            title: noteTitle,
            excerpt: intro || '专注凤凰单丛茶，分享茶知识与品鉴心得',
            likes: 0,
            comments: 0,
            keywords: ['凤凰单丛', '单丛茶'],
            publishedAt: '2026-03-01',
            hotComments: [],
          })
        }

        allAccounts.push({
          id: userId,
          nickname,
          followers,
          totalLikes,
          intro,
          notes: recent,
          _raw: item,
        })
      }
    } catch (e) {
      // 跳过无效文件
    }
  }

  // 按粉丝数降序
  allAccounts.sort((a, b) => parseFollowers(b.followers) - parseFollowers(a.followers))

  return allAccounts
}

export async function GET() {
  try {
    const accounts = loadXHSAccounts()
    const today = new Date().toISOString().slice(0, 10)
    return NextResponse.json({
      accounts,
      lastUpdated: today,
      count: accounts.length,
    })
  } catch (e) {
    return NextResponse.json({ accounts: [], lastUpdated: '', count: 0, error: String(e) })
  }
}

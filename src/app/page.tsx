'use client'

import { useState, useEffect } from 'react'

// 示例数据（格式与历史 JSON 一致）
const sampleAccounts = [
  {
    id: '5653041576',
    nickname: '品茶百科',
    followers: '28.7万',
    intro: '专注单丛茶知识科普，每天认识一款茶',
    notes: [
      {
        title: '茶知识｜一文读懂凤凰单丛入门到精通',
        excerpt: '很多人第一次喝凤凰单丛就被「鸭屎香」的名字劝退，其实这是凤凰山上的一个茶树品种名字，因为叶子像鸭屎而得名。',
        likes: 2869,
        comments: 87,
        keywords: ['鸭屎香', '品种科普', '入门指南'],
        publishedAt: '2026-03-15',
        hotComments: [
          { user: '茶小白001', text: '原来鸭屎香名字是这么来的！涨知识了' },
          { user: '潮汕阿妹', text: '我家那边满山都是这个香' },
          { user: '喝茶的猫', text: '这个比喻好贴切' },
        ]
      },
      {
        title: '每天认识一款茶——蜜兰香',
        excerpt: '蜜兰香是凤凰单丛里最经典的一款，既有蜂蜜的甜香，又有兰花的幽香，冲泡时满屋飘香。',
        likes: 1771,
        comments: 52,
        keywords: ['蜜兰香', '经典香型', '冲泡'],
        publishedAt: '2026-02-20',
        hotComments: [
          { user: '茶香一味', text: '蜜兰香真的是入门首选' },
          { user: '深圳茶客', text: '回甘太好了，强烈推荐' },
          { user: '老林说茶', text: '我家常备这款' },
        ]
      },
      {
        title: '凤凰单丛为什么这么香？制茶工艺大揭秘',
        excerpt: '单丛茶的香气来自做青环节，通过反复摇青让茶叶边缘碰撞发酵，才能产生独特的花果香。',
        likes: 1342,
        comments: 41,
        keywords: ['制茶工艺', '做青', '香气来源'],
        publishedAt: '2026-01-10',
        hotComments: [
          { user: '茶农的儿子', text: '我爸做了三十年茶就是这个流程' },
          { user: '好奇宝宝', text: '原来香是这么做出来的' },
        ]
      },
      {
        title: '2024年春茶采摘日记｜凤凰山实拍',
        excerpt: '今年雨水充足，春茶品质特别好。从海拔900米的茶园采摘，每一片茶叶都是手工挑选。',
        likes: 645,
        comments: 28,
        keywords: ['春茶', '原产地', '手工采摘'],
        publishedAt: '2024-03-15',
        hotComments: [
          { user: '茶农小张', text: '海拔900米的茶确实不一样' },
        ]
      }
    ]
  },
  {
    id: '3804537242',
    nickname: '壹房茶事精制单丛',
    followers: '12.3万',
    intro: '专注单丛茶精制与冲泡方法分享',
    notes: [
      {
        title: '如何泡出一壶好单丛？水温与时间的黄金比例',
        excerpt: '单丛茶不能用100度沸水直接冲泡，85-90度最合适。第一泡洗茶10秒，第二泡15秒出汤，之后每泡增加5秒。',
        likes: 892,
        comments: 34,
        keywords: ['冲泡技巧', '水温', '实操教程'],
        publishedAt: '2026-03-28',
        hotComments: [
          { user: '新手喝茶', text: '终于知道为什么我泡的苦了' },
          { user: '功夫茶爱好者', text: '85度确实刚好' },
          { user: '茶艺师小王', text: '这个方法很实用' },
        ]
      },
      {
        title: '春茶预售｜自家凤凰山茶园直发',
        excerpt: '来自凤凰山乌岽村海拔1000米的茶园，今年春茶品质历年最佳，现在预订享首发价。',
        likes: 456,
        comments: 18,
        keywords: ['春茶预售', '乌岽村', '原产地'],
        publishedAt: '2026-02-05',
        hotComments: [
          { user: '爱喝茶的老李', text: '海拔1000米的好茶' },
          { user: '茶小白', text: '首发价多少呀' },
        ]
      },
      {
        title: '老笔记：2024年单丛评测',
        excerpt: '2024年的单丛茶评测记录，仅供参考。',
        likes: 234,
        comments: 12,
        keywords: ['评测', '老笔记'],
        publishedAt: '2024-05-20',
        hotComments: [
          { user: '茶友', text: '去年的记录了' },
        ]
      }
    ]
  },
  {
    id: '26564302235',
    nickname: '观云枞凤凰单丛-阿彬',
    followers: '8.6万',
    intro: '凤凰山本地茶商，原产地直发',
    notes: [
      {
        title: '2026年春茶采摘日记｜凤凰山实拍',
        excerpt: '今年雨水充足，春茶品质特别好。从海拔900米的茶园采摘，每一片茶叶都是手工挑选，保证品质。',
        likes: 645,
        comments: 28,
        keywords: ['春茶', '原产地', '手工采摘'],
        publishedAt: '2026-03-20',
        hotComments: [
          { user: '茶农小张', text: '海拔900米的茶确实不一样' },
          { user: '爱喝茶的老李', text: '原产地直发价格怎么样' },
          { user: '茶小白', text: '实拍图好有质感' },
        ]
      },
      {
        title: '2024年春茶采摘日记｜凤凰山实拍',
        excerpt: '去年雨水充足，春茶品质特别好。从海拔900米的茶园采摘，每一片茶叶都是手工挑选。',
        likes: 645,
        comments: 28,
        keywords: ['春茶', '原产地', '手工采摘'],
        publishedAt: '2024-03-15',
        hotComments: [
          { user: '茶农小张', text: '海拔900米的茶确实不一样' },
        ]
      }
    ]
  },
  {
    id: '496909032',
    nickname: '阿爽单丛茶',
    followers: '6.2万',
    intro: '凤凰单丛香型科普，茶知识分享',
    notes: [
      {
        title: '凤凰单丛十大香型，一次说清楚',
        excerpt: '很多人分不清单丛的香型，主要就是十大香型：蜜兰香、芝兰香、玉兰香、桂花香、夜来香、茉莉香、杏仁香、肉桂香、柚花香、姜花香。',
        likes: 1203,
        comments: 45,
        keywords: ['香型', '十大香型', '入门科普'],
        publishedAt: '2026-04-01',
        hotComments: [
          { user: '茶小白001', text: '终于有人整理清楚了' },
          { user: '收藏夹', text: '这个帖子必须收藏' },
          { user: '茶友老周', text: '姜花香最稀有了' },
        ]
      }
    ]
  },
  {
    id: '302822505',
    nickname: '鼎晟茶业',
    followers: '4.8万',
    intro: '专业单丛茶供应商，批发零售',
    notes: [
      {
        title: '为什么懂茶的人都喝凤凰单丛？',
        excerpt: '凤凰单丛是广东乌龙茶的天花板，香气是所有茶类里最丰富、最多变的。一株茶树一种香，这就是凤凰单丛的魅力。',
        likes: 534,
        comments: 22,
        keywords: ['行业分析', '品质', '为什么喝'],
        publishedAt: '2025-12-15',
        hotComments: [
          { user: '茶商老陈', text: '说的很中肯' },
          { user: '喝茶养生', text: '确实越喝越上瘾' },
          { user: '茶小白', text: '被种草了' },
        ]
      },
      {
        title: '2024年单丛市场回顾',
        excerpt: '2024年单丛茶市场分析报告。',
        likes: 234,
        comments: 10,
        keywords: ['市场分析', '年度回顾'],
        publishedAt: '2024-12-20',
        hotComments: [
          { user: '茶商', text: '去年的数据了' },
        ]
      }
    ]
  }
]

// 按粉丝数排序（万单位）
function parseFollowers(s: string): number {
  const match = s.match(/([\d.]+)万/)
  return match ? parseFloat(match[1]) : 0
}

// 截取字符串，保留指定字数
function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

// 格式化日期为 3月15日
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日`
}

// 近半月截止日期
const cutoff = new Date()
cutoff.setDate(cutoff.getDate() - 15)

function filterRecentNotes(notes: typeof sampleAccounts[0]['notes']) {
  return notes.filter(note => {
    const d = new Date(note.publishedAt || '2025-01-01')
    return d >= cutoff
  })
}

export default function HomePage() {
  const [accounts, setAccounts] = useState<typeof sampleAccounts>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/history')
        if (res.ok) {
          const data = await res.json()
          if (data.accounts && Array.isArray(data.accounts)) {
            // 过滤每个账号的笔记
            const filteredAccounts = data.accounts
              .map((account: any) => ({
                ...account,
                notes: filterRecentNotes(account.notes)
              }))
              .filter((account: any) => account.notes.length > 0)
              .sort((a: any, b: any) => parseFollowers(b.followers) - parseFollowers(a.followers))
            setAccounts(filteredAccounts)
            setLoading(false)
            return
          }
        }
      } catch {}
      // fallback 到示例数据，同样过滤
      const filteredSample = sampleAccounts
        .map(account => ({
          ...account,
          notes: filterRecentNotes(account.notes)
        }))
        .filter(account => account.notes.length > 0)
        .sort((a, b) => parseFollowers(b.followers) - parseFollowers(a.followers))
      setAccounts(filteredSample)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍵</span>
            <h1 className="text-xl font-bold text-gray-900">TeaTrend</h1>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 text-sm">凤凰单丛情报站</span>
          </div>
          <span className="text-xs text-gray-400">数据每日更新</span>
        </div>
      </header>

      {/* 统计信息 */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="text-gray-400">📅</span>
            {loading ? '...' : 
              accounts.length > 0 
                ? `近半月：${formatDate(cutoff.toISOString())} ~ ${new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}`
                : '暂无近半月数据'
            }
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-gray-400">🔍</span>
            关键词：凤凰单丛、鸭屎香、蜜兰香
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-gray-400">👤</span>
            {loading ? '...' : accounts.length} 个采集账号
          </span>
        </div>
      </section>

      {/* 账号分析卡片 */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无数据</div>
        ) : (
          <div className="space-y-5">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-gray-400 text-sm">
        <p>数据来源小红书 · 每日更新 🐸 TeaTrend</p>
      </footer>
    </main>
  )
}

// 单个账号卡片组件
function AccountCard({ account }: { account: typeof sampleAccounts[0] }) {
  const recentNotes = filterRecentNotes(account.notes)
  // 近半月最热3条，按阅读+点赞+评论综合权重排序
  const topNotes = [...recentNotes]
    .sort((a, b) => {
      const scoreA = (a.likes || 0) * 1 + (a.comments || 0) * 5
      const scoreB = (b.likes || 0) * 1 + (b.comments || 0) * 5
      return scoreB - scoreA
    })
    .slice(0, 3)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      {/* 账号头部 */}
      <div className="flex items-center gap-3 mb-2">
        {/* 真实头像：优先用 avatar URL，无则首字母兜底 */}
        {(account as any).avatar ? (
          <img
            src={(account as any).avatar}
            alt={account.nickname}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-gray-100"
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-lg flex-shrink-0"
          style={{ display: (account as any).avatar ? 'none' : 'flex' }}>
          {account.nickname[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-gray-900 truncate max-w-[60%]">{account.nickname}</h3>
            <span className="text-gray-500 text-sm flex-shrink-0">粉丝 {account.followers}</span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5 leading-snug truncate">{account.intro}</p>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="border-t border-gray-100 my-3" />

      {/* 顶部：TOP3 小标签 */}
      <div className="mb-3">
        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
          🔥 TOP 3 内容
        </span>
      </div>

      {/* 热门笔记列表 */}
      <div className="space-y-4">
        {topNotes.map((note, idx) => (
          <NoteItem key={idx} note={note} />
        ))}
      </div>
    </div>
  )
}

// 单篇笔记组件
function NoteItem({ note }: { note: typeof sampleAccounts[0]['notes'][0] }) {
  return (
    <div>
      {/* 标题 bold + 时间 */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h5 className="text-sm font-medium text-gray-900 leading-snug flex-1">
          {note.title}
        </h5>
        <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
          {note.publishedAt ? formatDate(note.publishedAt) : ''}
        </span>
      </div>

      {/* 精华引用：灰色，左侧绿线，最多100字 */}
      <blockquote className="text-gray-600 text-sm border-l-2 border-green-600 pl-3 mt-2 mb-2 leading-relaxed">
        {truncate(note.excerpt, 100)}
      </blockquote>

      {/* 关键词标签 */}
      <div className="flex flex-wrap gap-1 mb-2">
        {note.keywords.map((kw) => (
          <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1">
            {kw}
          </span>
        ))}
      </div>

      {/* 点赞/评论数 */}
      <div className="flex items-center gap-3 text-gray-400 text-xs mb-2">
        <span>👍 {note.likes.toLocaleString()}</span>
        <span>💬 {note.comments.toLocaleString()}</span>
        {note.hotComments.length > 0 && (
          <span className="text-orange-500 font-medium">🔥 热评 {note.hotComments.length}条</span>
        )}
      </div>

      {/* 【热评摘录】 */}
      {note.hotComments.length > 0 && (
        <div className="mt-2 bg-orange-50 rounded-lg p-3 space-y-1.5">
          {note.hotComments.slice(0, 3).map((c, i) => (
            <div key={i} className="text-xs text-gray-700 leading-relaxed">
              <span className="font-medium text-orange-600">{c.user}</span>{' '}
              <span className="text-gray-500">·</span> {c.text}
            </div>
          ))}
        </div>
      )}

      {/* 卡片底部虚线分隔 */}
      <div className="border-t border-dashed border-gray-200 mt-4" />
    </div>
  )
}

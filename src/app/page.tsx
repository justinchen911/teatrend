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
        keywords: ['鸭屎香', '入门', '品种科普'],
        hotComments: [
          { user: '茶小白001', text: '原来鸭屎香名字是这么来的！涨知识了' },
          { user: '潮汕阿妹', text: '我家那边满山都是这个香' },
          { user: '喝茶的猫', text: '这个比喻好贴切' },
        ]
      },
      {
        title: '每天认识一款茶——蜜兰香',
        excerpt: '蜜兰香是凤凰单丛里最经典的一款，既有蜂蜜的甜香，又有兰花的幽香。冲泡时满屋飘香，茶汤入口甘甜，回甘持久。',
        likes: 1771,
        comments: 52,
        keywords: ['蜜兰香', '经典', '冲泡技巧'],
        hotComments: [
          { user: '茶香一味', text: '蜜兰香真的是入门首选' },
          { user: '深圳茶客', text: '回甘太好了，强烈推荐' },
          { user: '老林说茶', text: '我家常备这款' },
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
        hotComments: [
          { user: '新手喝茶', text: '终于知道为什么我泡的苦了' },
          { user: '功夫茶爱好者', text: '85度确实刚好' },
          { user: '茶艺师小王', text: '这个方法很实用' },
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
        title: '2024年春茶采摘日记｜凤凰山实拍',
        excerpt: '今年雨水充足，春茶品质特别好。我们从海拔900米的茶园采摘，每一片茶叶都是手工挑选，保证品质。',
        likes: 645,
        comments: 28,
        keywords: ['春茶', '原产地', '手工采摘'],
        hotComments: [
          { user: '茶农小张', text: '海拔900米的茶确实不一样' },
          { user: '爱喝茶的老李', text: '原产地直发价格怎么样' },
          { user: '茶小白', text: '实拍图好有质感' },
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
        excerpt: '很多人分不清单丛的香型，其实主要就是十大香型：蜜兰香、芝兰香、玉兰香、桂花香、夜来香、茉莉香、杏仁香、肉桂香、柚花香、姜花香。',
        likes: 1203,
        comments: 45,
        keywords: ['香型', '十大香型', '入门科普'],
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
        excerpt: '凤凰单丛是广东乌龙茶的天花板，它的香气是所有茶类里最丰富、最多变的。一株茶树一种香，这就是凤凰单丛的魅力。',
        likes: 534,
        comments: 22,
        keywords: ['行业分析', '品质', '为什么喝'],
        hotComments: [
          { user: '茶商老陈', text: '说的很中肯' },
          { user: '喝茶养生', text: '确实越喝越上瘾' },
          { user: '茶小白', text: '被种草了' },
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

export default function HomePage() {
  const [accounts, setAccounts] = useState<typeof sampleAccounts>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 尝试加载历史数据
    async function loadData() {
      try {
        const res = await fetch('/api/history')
        if (res.ok) {
          const data = await res.json()
          if (data.accounts && Array.isArray(data.accounts)) {
            setAccounts(data.accounts.sort((a: any, b: any) => parseFollowers(b.followers) - parseFollowers(a.followers)))
            setLoading(false)
            return
          }
        }
      } catch {}
      // 回退到示例数据
      setAccounts([...sampleAccounts].sort((a, b) => parseFollowers(b.followers) - parseFollowers(a.followers)))
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
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 近半月数据
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
          <div className="grid md:grid-cols-2 gap-5">
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
  // 按点赞排序取 TOP 笔记
  const topNotes = [...account.notes]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      {/* 账号头部 */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600 flex-shrink-0">
          {account.nickname[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{account.nickname}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{account.followers} 粉丝</p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">{account.intro}</p>
        </div>
      </div>

      {/* 近半月内容 TOP */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-medium text-white bg-green-600 px-2 py-0.5 rounded">
            近半月内容 TOP
          </span>
        </div>

        <div className="space-y-4">
          {topNotes.map((note, idx) => (
            <NoteItem key={idx} note={note} />
          ))}
        </div>
      </div>
    </div>
  )
}

// 单篇笔记组件
function NoteItem({ note }: { note: typeof sampleAccounts[0]['notes'][0] }) {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
      {/* 标题 */}
      <h4 className="text-gray-900 text-sm font-medium leading-snug mb-1.5">
        {note.title}
      </h4>

      {/* 精华引用 */}
      <blockquote className="text-gray-500 italic text-sm border-l-2 border-green-600 pl-3 mt-2 mb-2 leading-relaxed">
        「{note.excerpt.length > 60 ? note.excerpt.slice(0, 60) + '…' : note.excerpt}」
      </blockquote>

      {/* 关键词标签 */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {note.keywords.map((kw) => (
          <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {kw}
          </span>
        ))}
      </div>

      {/* 点赞和评论数 */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
        <span>❤️ {note.likes.toLocaleString()}</span>
        <span>💬 {note.comments}</span>
      </div>

      {/* 热评摘录 */}
      {note.hotComments.length > 0 && (
        <div className="bg-gray-50 rounded p-2 space-y-1.5">
          <p className="text-xs text-gray-400 font-medium mb-1">🔥 热评摘录</p>
          {note.hotComments.slice(0, 3).map((c, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <span className="font-medium text-gray-700">{c.user}:</span>
              <span className="text-gray-500 ml-1">
                {c.text.length > 22 ? c.text.slice(0, 22) + '…' : c.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍵</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              TeaTrend
            </h1>
          </div>
          <span className="text-slate-400 text-sm">凤凰单丛 · 茶赛道情报</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-4xl font-bold mb-4">
          追踪
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            凤凰单丛
          </span>
          赛道最新动态
        </h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          专注单丛茶博主，洞察选题趋势，发现茶行业增长机会
        </p>

        {/* 关键词标签 */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {['凤凰单丛', '鸭屎香', '蜜兰香', '潮州茶叶', '工夫茶', '芝兰香'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/30">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* 小红书内容流 */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span>📕</span> 小红书单丛笔记
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { author: '茶叶百科', title: '茶知识｜一文读懂凤凰单丛入门到精通', likes: '2869', tag: '凤凰单丛' },
            { author: '品茶百科', title: '每天认识一款茶——凤凰单丛', likes: '1771', tag: '凤凰单丛' },
            { author: '茶颜观色单丛小店铺', title: '【免费领取】凤凰单丛品鉴装', likes: '927', tag: '凤凰单丛' },
            { author: '静檀茶坊', title: '凤凰单丛 | 闻如香水的茶叶', likes: '513', tag: '凤凰单丛' },
            { author: '小鱼爱喝茶', title: '沉浸式泡茶~', likes: '257', tag: '凤凰单丛' },
            { author: '茶颜观色单丛小店铺', title: '凤凰单丛六大经典香型品鉴装免费送', likes: '222', tag: '香型' },
          ].map((card, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-green-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">
                  {card.author[0]}
                </span>
                <span className="text-slate-300 text-sm">{card.author}</span>
                <span className="ml-auto text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded">{card.tag}</span>
              </div>
              <p className="text-white text-sm mb-3 leading-relaxed">{card.title}</p>
              <div className="flex items-center gap-3 text-slate-500 text-xs">
                <span>❤️ {card.likes}</span>
                <span>📕 小红书</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-slate-500 text-sm text-center mt-6">
          每天 09:00 自动更新 · 关键词：凤凰单丛 · 鸭屎香 · 蜜兰香 · 潮州茶叶
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>⏰ 每日 09:00 采集推送 🐸 TeaTrend</p>
      </footer>
    </main>
  )
}

import { Flame, TrendingUp, Eye } from 'lucide-react'

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
          <span className="text-slate-400 text-sm">茶赛道热搜监控</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-4xl font-bold mb-4">
          实时监控
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            茶赛道
          </span>
          热搜趋势
        </h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          覆盖抖音、微博、B站、小红书四大平台，第一时间发现茶行业热点话题
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: '抖音热搜', count: 51, color: 'from-pink-500 to-rose-500' },
            { label: '微博热搜', count: 78, color: 'from-orange-500 to-amber-500' },
            { label: 'B站热搜', count: 20, color: 'from-blue-500 to-cyan-500' },
            { label: '茶相关', count: 0, color: 'from-green-500 to-emerald-500' },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors"
            >
              <div className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                {s.count}
              </div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hot Search Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {/* 抖音 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
              <Flame className="w-5 h-5 text-pink-400" />
              <span className="font-semibold text-pink-400">抖音热搜</span>
              <span className="ml-auto text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full">
                51条
              </span>
            </div>
            <div className="p-4 space-y-2 text-sm max-h-80 overflow-y-auto">
              {[
                '培育更多"中国服务"品牌',
                '习近平会见郑丽文',
                '3月份CPI同比上涨1.0%',
                '中国海上风电实现新突破',
                '我拍到了超有料的春天',
                '普京宣布将停火32小时',
                '去春天里遛遛自己',
                '春天是最好的心理委员',
                '小树本就该在森林里长大',
              ].map((title, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-700/30 cursor-pointer group"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < 3 ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-slate-300 group-hover:text-white truncate">{title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 微博 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="font-semibold text-orange-400">微博热搜</span>
              <span className="ml-auto text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                78条
              </span>
            </div>
            <div className="p-4 space-y-2 text-sm max-h-80 overflow-y-auto">
              {[
                '总书记谈为民造福是最大政绩',
                '#十日终焉开机#',
                '#李在明转发以色列士兵虐童视频#',
                '#赏花经济开出四季春#',
                '#胡先煦官宣十日终焉#',
                '#婆婆得知儿子被海葬状告儿媳孙女#',
                '#男子杀害22岁前女友藏床底开冷气#',
                '#浪姐曾邀请孟子义被拒绝了#',
                '#李斌称闪充再快也比换电慢#',
              ].map((title, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-700/30 cursor-pointer group"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-slate-300 group-hover:text-white truncate">{title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* B站 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-blue-400">B站热搜</span>
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                20条
              </span>
            </div>
            <div className="p-4 space-y-2 text-sm max-h-80 overflow-y-auto">
              {[
                '习近平会见郑丽文',
                '我国超导领域两种全新材料问世',
                '2026年强基计划报名开启',
                'AI红利和普通人有何关系',
                '3月我国CPI上涨说明了什么',
                '网警打掉利用外挂抢票犯罪团伙',
                '西班牙首相访华有何目的',
                '有兽焉',
                'AI创作真的无门槛吗',
              ].map((title, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-700/30 cursor-pointer group"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < 3 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-slate-300 group-hover:text-white truncate">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tea Alert */}
        <div className="mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">🌿</div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">今日暂无茶热搜</h3>
          <p className="text-slate-400 text-sm">
            茶叶是垂直小众赛道，热搜竞争激烈，不一定每天上榜。<br/>
            TeaTrend 持续监控，发现爆发时刻会第一时间推送。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>⏰ 关注 TeaTrend，发现茶赛道每一次爆发 🐸</p>
        <p className="mt-2 text-xs text-slate-600">数据来源：TikHub API | 每日 09:00 更新</p>
      </footer>
    </main>
  )
}

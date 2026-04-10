import { Zap, Shield, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          下一代 SaaS 产品
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          借助 AI 驱动的洞察和极致的用户体验，助力团队高效协作、快速迭代。
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
            立即开始
          </button>
          <button className="px-6 py-3 border border-slate-500 hover:border-slate-400 rounded-lg font-medium transition-colors">
            了解更多
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <Zap className="w-8 h-8 text-yellow-400" />,
            title: '极速响应',
            desc: '基于边缘计算，全球毫秒级延迟，用户体验流畅无卡顿。',
          },
          {
            icon: <Shield className="w-8 h-8 text-green-400" />,
            title: '安全可靠',
            desc: '端到端加密、细粒度权限控制，保障数据主权与隐私。',
          },
          {
            icon: <BarChart3 className="w-8 h-8 text-blue-400" />,
            title: '数据驱动',
            desc: '实时仪表盘 + AI 洞察，让每一次决策都有据可依。',
          },
        ].map((f, i) => (
          <div
            key={i}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
          >
            <div className="mb-4">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

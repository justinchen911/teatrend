'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DateRangePicker from './DateRangePicker';

const navItems = [
  { name: '总览', href: '/', icon: '📊' },
  { name: '内容流', href: '/content', icon: '📝' },
  { name: '账号分析', href: '/accounts', icon: '👥' },
  { name: '热点趋势', href: '/trends', icon: '🔥' },
  { name: '日报', href: '/daily', icon: '📋' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [platform, setPlatform] = useState('all');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 移动端导航遮罩 */}
      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      {/* 左侧导航栏 */}
      <aside
        className={`fixed left-0 top-0 h-full w-56 bg-gray-800/80 backdrop-blur-sm border-r border-gray-700/50 z-50 transition-transform lg:translate-x-0 ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-700/50">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🍵</span>
            <span>TeaTrend</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">凤凰单丛热点追踪</p>
        </div>

        <nav className="p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
                onClick={() => setIsNavOpen(false)}
              >
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>系统运行正常</span>
            </div>
            <div>v1.0.0</div>
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="lg:ml-56">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsNavOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              <span className="text-xl">☰</span>
            </button>

            <div className="flex items-center gap-4 flex-1">
              {/* 日期选择器 */}
              <DateRangePicker
                startDate="2026-04-04"
                endDate="2026-04-10"
              />

              {/* 平台筛选 */}
              <div className="flex items-center gap-2 ml-auto">
                {['all', 'xiaohongshu', 'douyin', 'shipinhao'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      platform === p
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {p === 'all' ? '全部' : p === 'xiaohongshu' ? '📕小红书' : p === 'douyin' ? '🎵抖音' : '📱视频号'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
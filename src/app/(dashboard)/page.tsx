'use client';

import { mockStats, mockTopics, mockAccounts, mockTrendData } from '@/lib/mock-data';
import StatCard from '@/components/dashboard/StatCard';
import TopicTag from '@/components/dashboard/TopicTag';
import MiniBarChart from '@/components/dashboard/MiniBarChart';
import PlatformIcon from '@/components/dashboard/PlatformIcon';

export default function OverviewPage() {
  // 活跃账号 TOP5
  const topActiveAccounts = [...mockAccounts]
    .sort((a, b) => b.postsCount - a.postsCount)
    .slice(0, 5);

  // 转换趋势数据格式
  const trendChartData = mockTrendData.map((d) => ({
    label: d.date.slice(5),
    value: d.posts,
  }));

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">数据总览</h1>
        <p className="text-gray-400 text-sm mt-1">凤凰单丛热点追踪实时数据</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📝"
          value={mockStats.todayPosts}
          label="今日新增内容"
          trend="up"
          trendValue="12%"
        />
        <StatCard
          icon="👥"
          value={mockStats.totalAccounts}
          label="追踪账号总数"
          trend="up"
          trendValue="2"
        />
        <StatCard
          icon="🔥"
          value={mockStats.hotTopicsCount}
          label="热门话题数"
          trend="stable"
          trendValue="0"
        />
        <StatCard
          icon="💬"
          value={mockStats.avgEngagement.toLocaleString()}
          label="平均互动量"
          trend="up"
          trendValue="8%"
        />
      </div>

      {/* 热门话题和活跃账号 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 热门话题 TOP10 */}
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
          <h2 className="text-lg font-semibold text-white mb-4">热门话题 TOP10</h2>
          <div className="space-y-1">
            {mockTopics.map((topic, index) => (
              <TopicTag key={topic.keyword} topic={topic} rank={index + 1} />
            ))}
          </div>
        </div>

        {/* 最活跃账号 TOP5 */}
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
          <h2 className="text-lg font-semibold text-white mb-4">最活跃账号 TOP5</h2>
          <div className="space-y-3">
            {topActiveAccounts.map((account, index) => (
              <div
                key={account.id}
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
              >
                <span className={`text-sm font-medium w-6 ${
                  index < 3 ? 'text-green-400' : 'text-gray-500'
                }`}>
                  #{index + 1}
                </span>
                <img
                  src={account.avatar}
                  alt={account.nickname}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium truncate">
                      {account.nickname}
                    </span>
                    <PlatformIcon platform={account.platform} size="sm" />
                  </div>
                  <div className="text-xs text-gray-400">
                    {account.postsCount} 帖子 · {account.followers.toLocaleString()} 粉丝
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近7天趋势 */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
        <h2 className="text-lg font-semibold text-white mb-4">最近7天内容发布趋势</h2>
        <div className="h-40">
          <MiniBarChart
            data={trendChartData}
            height={140}
            color="#2d6a4f"
          />
        </div>
      </div>
    </div>
  );
}
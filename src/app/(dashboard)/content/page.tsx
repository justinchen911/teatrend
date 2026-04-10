'use client';

import { useState, useMemo } from 'react';
import { mockPosts, Post } from '@/lib/mock-data';
import ContentCard from '@/components/dashboard/ContentCard';

type Platform = 'all' | 'xiaohongshu' | 'douyin' | 'shipinhao';
type SortBy = 'time' | 'engagement';

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState<Platform>('all');
  const [sortBy, setSortBy] = useState<SortBy>('time');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPosts = useMemo(() => {
    let filtered = [...mockPosts];

    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 平台筛选
    if (platform !== 'all') {
      filtered = filtered.filter((post) => post.platform === platform);
    }

    // 排序
    if (sortBy === 'time') {
      filtered.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } else {
      filtered.sort((a, b) => {
        const engA = a.likes + a.comments + a.collects + a.shares;
        const engB = b.likes + b.comments + b.collects + b.shares;
        return engB - engA;
      });
    }

    return filtered;
  }, [searchQuery, platform, sortBy]);

  // 分页
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const platformLabels = {
    all: '全部',
    xiaohongshu: '📕小红书',
    douyin: '🎵抖音',
    shipinhao: '📱视频号',
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">内容流</h1>
        <p className="text-gray-400 text-sm mt-1">追踪所有平台的内容发布</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索内容、标题、标签..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* 排序 */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
        >
          <option value="time">按时间排序</option>
          <option value="engagement">按互动量排序</option>
        </select>
      </div>

      {/* 平台 Tab */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(platformLabels) as Platform[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              setPlatform(p);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              platform === p
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-400 hover:bg-gray-800 border border-transparent'
            }`}
          >
            {platformLabels[p]}
          </button>
        ))}
      </div>

      {/* 内容列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedPosts.map((post) => (
          <ContentCard key={post.id} post={post} />
        ))}
      </div>

      {/* 空状态 */}
      {paginatedPosts.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="text-gray-400">没有找到相关内容</p>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-gray-400 text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
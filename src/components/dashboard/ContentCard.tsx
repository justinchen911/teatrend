'use client';

import { Post } from '@/lib/mock-data';
import PlatformIcon from './PlatformIcon';
import RelativeTime from './RelativeTime';

interface ContentCardProps {
  post: Post;
}

export default function ContentCard({ post }: ContentCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/5">
      <div className="flex items-start gap-3 mb-3">
        <PlatformIcon platform={post.platform} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
            {post.title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2">{post.content}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <img
          src={post.author.avatar}
          alt={post.author.nickname}
          className="w-5 h-5 rounded-full"
        />
        <span className="text-gray-300 text-xs">{post.author.nickname}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <span>👍</span> {post.likes.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <span>💬</span> {post.comments.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <span>⭐</span> {post.collects.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <span>🔄</span> {post.shares.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <RelativeTime date={post.publishedAt} />
      </div>
    </div>
  );
}

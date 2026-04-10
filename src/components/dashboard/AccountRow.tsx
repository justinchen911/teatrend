'use client';

import { Account } from '@/lib/mock-data';
import PlatformIcon from './PlatformIcon';

interface AccountRowProps {
  account: Account;
  onClick?: () => void;
}

export default function AccountRow({ account, onClick }: AccountRowProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-green-500/30 hover:bg-gray-800/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <img
        src={account.avatar}
        alt={account.nickname}
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-medium truncate">{account.nickname}</h3>
          <PlatformIcon platform={account.platform} size="sm" />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{account.location}</span>
          <span>·</span>
          <span>{account.followers.toLocaleString()} 粉丝</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white text-sm font-medium">{account.postsCount}</div>
        <div className="text-gray-400 text-xs">帖子</div>
      </div>
    </div>
  );
}

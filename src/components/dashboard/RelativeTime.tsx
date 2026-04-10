'use client';

interface RelativeTimeProps {
  date: string;
}

export default function RelativeTime({ date }: RelativeTimeProps) {
  const getRelativeTime = () => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return target.toLocaleDateString('zh-CN');
  };

  return (
    <span className="text-xs text-gray-500">
      {getRelativeTime()}
    </span>
  );
}
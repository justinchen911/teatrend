'use client';

import { Topic } from '@/lib/mock-data';

interface TopicTagProps {
  topic: Topic;
  rank?: number;
}

export default function TopicTag({ topic, rank }: TopicTagProps) {
  const getTrendIcon = () => {
    if (topic.trend === 'up') return '↑';
    if (topic.trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (topic.trend === 'up') return 'text-green-400';
    if (topic.trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-800/30 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        {rank && (
          <span className={`text-sm font-medium w-6 ${
            rank <= 3 ? 'text-green-400' : 'text-gray-500'
          }`}>
            #{rank}
          </span>
        )}
        <span className="text-white font-medium">{topic.keyword}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">
          {topic.mentions.toLocaleString()}
        </span>
        <span className={`text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="ml-0.5">{Math.abs(topic.change)}%</span>
        </span>
      </div>
    </div>
  );
}

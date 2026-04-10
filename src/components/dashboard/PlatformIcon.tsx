'use client';

type Platform = 'xiaohongshu' | 'douyin' | 'shipinhao';

interface PlatformIconProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
}

export default function PlatformIcon({ platform, size = 'md' }: PlatformIconProps) {
  const config = {
    xiaohongshu: {
      icon: '📕',
      name: '小红书',
    },
    douyin: {
      icon: '🎵',
      name: '抖音',
    },
    shipinhao: {
      icon: '📱',
      name: '视频号',
    },
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const platformConfig = config[platform];

  return (
    <span
      className={`${sizeClasses[size]} inline-flex items-center`}
      title={platformConfig.name}
    >
      {platformConfig.icon}
    </span>
  );
}

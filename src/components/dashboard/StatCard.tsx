'use client';

interface StatCardProps {
  icon: string;
  value: number | string;
  label: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export default function StatCard({ icon, value, label, trend, trendValue }: StatCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-green-500/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="text-3xl mb-3">{icon}</div>
        {trend && trendValue && (
          <div className={`flex items-center text-sm ${getTrendColor()}`}>
            <span className="mr-1">{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

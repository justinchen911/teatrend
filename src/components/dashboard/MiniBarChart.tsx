'use client';

interface MiniBarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  height?: number;
  color?: string;
}

export default function MiniBarChart({
  data,
  maxValue,
  height = 100,
  color = '#2d6a4f',
}: MiniBarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className="flex items-end justify-between gap-1" style={{ height }}>
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100;
        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div
              className="w-full rounded-t transition-all hover:opacity-80"
              style={{
                height: `${percentage}%`,
                backgroundColor: color,
                minHeight: item.value > 0 ? '4px' : '0',
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-[10px] text-gray-500 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

'use client';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange?: (start: string, end: string) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChange?.(e.target.value, endDate)}
        className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-green-500"
      />
      <span className="text-gray-500">至</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChange?.(startDate, e.target.value)}
        className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-green-500"
      />
    </div>
  );
}

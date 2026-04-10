'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
}

export default function DateRangePicker({ startDate, endDate }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">{startDate}</span>
      <span className="text-gray-600">→</span>
      <span className="text-sm text-gray-400">{endDate}</span>
    </div>
  );
}

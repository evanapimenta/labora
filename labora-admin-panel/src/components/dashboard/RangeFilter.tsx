'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface RangeFilterProps {
  currentRange: string;
}

export default function RangeFilter({ currentRange }: RangeFilterProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`?range=${e.target.value}`);
  };

  return (
    <select
      value={currentRange}
      onChange={handleChange}
      className="h-10 px-4 rounded-lg bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
    >
      <option value="30">Últimos 30 dias</option>
      <option value="7">Últimos 7 dias</option>
      <option value="month">Este mês</option>
      <option value="year">Último ano</option>
    </select>
  );
}

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface StatusFilterProps {
  currentStatus: string;
}

export default function StatusFilter({ currentStatus }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === 'all') {
      params.delete('status');
    } else {
      params.set('status', e.target.value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="h-8 px-2 rounded-lg bg-muted/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer font-medium text-foreground"
    >
      <option value="all">Todos os Status</option>
      <option value="Confirmado">Confirmado</option>
      <option value="Check-in">Check-in</option>
      <option value="Aguardando Resultado">Aguardando Resultado</option>
      <option value="Realizado">Realizado</option>
      <option value="Pendente">Pendente</option>
      <option value="Cancelado">Cancelado</option>
    </select>
  );
}

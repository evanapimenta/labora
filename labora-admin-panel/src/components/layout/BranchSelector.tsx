"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Building2 } from 'lucide-react';
import { setActiveBranch } from '@/actions/auth';
import { cn } from '@/lib/utils';

interface Branch {
  _id: string;
  name: string;
  laboratoryId?: string;
}

interface BranchSelectorProps {
  branches: Branch[];
  activeBranch: Branch | null;
}

export default function BranchSelector({ branches, activeBranch }: BranchSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = async (branchId: string) => {
    await setActiveBranch(branchId);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
      >
        {activeBranch ? activeBranch.name : 'Selecionar Filial'}
        <ChevronDown className="size-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-border bg-card py-1.5 shadow-elevated z-50">
          <div className="max-h-60 overflow-y-auto">
            {branches.length === 0 ? (
              <div className="px-4 py-2 text-xs text-muted-foreground italic text-center">
                Nenhuma filial encontrada
              </div>
            ) : (
              branches.map((branch) => {
                const isActive = activeBranch?._id === branch._id;
                return (
                  <button
                    key={branch._id}
                    type="button"
                    onClick={() => handleSelect(branch._id)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors cursor-pointer block",
                      isActive ? "text-primary font-semibold" : "text-foreground"
                    )}
                  >
                    {branch.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

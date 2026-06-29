"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Moon, LogOut, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { logoutAdmin, setActiveLab } from '@/actions/auth';
import { cn } from '@/lib/utils';
import BranchSelector from '@/components/layout/BranchSelector';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  user: any;
  userLabs?: any[];
  activeLab?: any;
  userBranches?: any[];
  activeBranch?: any;
}

export default function Header({ user, userLabs, activeLab, userBranches, activeBranch }: HeaderProps) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Carlos';
  const displayFirstName = user?.scope === 'TECH' && !firstName.startsWith('Téc. ') ? `Téc. ${firstName}` : firstName;
  const displayName = user?.scope === 'TECH' && !user.name.startsWith('Téc. ') ? `Téc. ${user.name}` : (user?.name || 'Carlos Admin');
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : "CA";

  const isSystemScope = user?.scope?.toUpperCase() === 'SYSTEM';
  const isLabScope = user?.scope?.toUpperCase() === 'LAB';

  const userRoleText = (isSystemScope || isLabScope)
    ? (activeLab?.labName || 'Sem Laboratório')
    : (user?.scope === 'BRANCH' ? 'Filial Admin' : (user?.scope === 'TECH' ? 'Técnico' : 'Super Admin'));

  const handleLogout = async () => {
    await logoutAdmin();
  };

  return (
    <header className="h-16 border-b border-border flex items-center px-4 md:px-8 gap-3 sticky top-0 z-20 bg-background/80 backdrop-blur-xl w-full">
      <div className="flex-1"></div>

      <div className="ml-auto flex items-center gap-2 relative">

        {userBranches && userBranches.length > 0 && pathname !== '/' && pathname !== '/equipe' && pathname !== '/configuracoes' && (
          <div className="hidden md:block border-r border-border pr-2 mr-1">
            <BranchSelector branches={userBranches} activeBranch={activeBranch} />
          </div>
        )}

        <button
          onClick={toggle}
          className="size-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Alternar tema"
          id="theme-toggle-btn"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>



        <Link
          href="/configuracoes"
          className="size-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Configurações"
          id="settings-btn"
        >
          <Settings className="size-4" />
        </Link>

        <div className="relative ml-2 flex items-center gap-2.5 pl-3 border-l border-border" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 text-left border-none bg-none p-0 cursor-pointer"
            id="profile-btn"
          >
            <div className="size-8 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium" style={{ background: "var(--gradient-accent)" }}>
              {initials}
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold leading-tight">{displayFirstName}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[120px]" title={userRoleText}>
                {userRoleText}
              </div>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-border bg-card p-1.5 shadow-elevated z-50 flex flex-col gap-0.5">
              <div className="px-3 py-2 border-b border-border mb-1">
                <div className="text-xs font-semibold">{displayName}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{userRoleText}</div>
              </div>

              {userLabs && userLabs.length > 0 && (
                <>
                  <div className="text-[10px] font-bold text-muted-foreground px-3 py-1.5 uppercase tracking-wider border-b border-border mb-1">
                    Selecionar Rede
                  </div>
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5 custom-scroll p-1">
                    {userLabs.map((lab) => {
                      const isSelected = activeLab?._id === lab._id;
                      return (
                        <button
                          key={lab._id}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await setActiveLab(lab._id);
                            window.location.reload();
                          }}
                          className={cn(
                            "w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between",
                            isSelected
                              ? "bg-primary/10 text-primary font-semibold"
                              : "hover:bg-muted text-foreground/80"
                          )}
                        >
                          <span className="truncate">{lab.labName}</span>
                          {isSelected && (
                            <ChevronRight className="size-3" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-border my-1" />
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

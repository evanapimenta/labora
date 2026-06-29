import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: any;
  userLabs: any[];
  activeLab: any;
  userBranches?: any[];
  activeBranch?: any;
}

export default function AdminLayout({ children, user, userLabs, activeLab, userBranches, activeBranch }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar user={user} userLabs={userLabs} activeLab={activeLab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} userLabs={userLabs} activeLab={activeLab} userBranches={userBranches} activeBranch={activeBranch} />
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { User } from '../../types';
import { LogOut, Database, User as UserIcon, Menu, X } from 'lucide-react';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarShellProps {
  brandSubLabel: string;
  navItems: SidebarNavItem[];
  activeNavId: string;
  onSelectNav: (id: string) => void;
  user: User;
  onOpenProfile: () => void;
  onOpenExport: () => void;
  onLogout: () => void;
  topBanner?: React.ReactNode;
  children: React.ReactNode;
}

export const SidebarShell: React.FC<SidebarShellProps> = ({
  brandSubLabel,
  navItems,
  activeNavId,
  onSelectNav,
  user,
  onOpenProfile,
  onOpenExport,
  onLogout,
  topBanner,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onSelectNav(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F7F7F7] flex flex-col md:flex-row text-[#1A1A1A] antialiased selection:bg-[#FFE27A] selection:text-[#1A1A1A]">
      {/* Desktop Left Sidebar (#FFE27A Warm Gold Rail per PDF) */}
      <aside className="hidden md:flex md:flex-col md:w-60 lg:w-64 bg-[#FFE27A] shrink-0 sticky top-0 h-[100dvh] border-r border-[#1A1A1A]/10 select-none">
        {/* Brand Block */}
        <div className="px-6 pt-7 pb-6">
          <div className="text-xl font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
            Cafe Lupe
          </div>
          <div className="text-xs font-semibold text-[#1A1A1A]/75 mt-0.5 truncate">
            {brandSubLabel}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeNavId;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                  isActive
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#1A1A1A]/80 hover:bg-white/40 hover:text-[#1A1A1A]'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF5252] text-[#1A1A1A] tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility & User Footer */}
        <div className="p-3.5 border-t border-[#1A1A1A]/10 space-y-1.5">
          <button
            onClick={onOpenExport}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1A1A1A]/80 hover:bg-white/40 hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>PHP & SQL Code</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#1A1A1A] hover:bg-white/40 transition-colors cursor-pointer text-left"
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">{user.name}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1A1A1A]/80 hover:bg-white/50 hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar (<= 15% viewport height) */}
      <header className="md:hidden sticky top-0 z-40 bg-[#FFE27A] border-b border-[#1A1A1A]/10 px-4 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-base font-extrabold text-[#1A1A1A] leading-none">Cafe Lupe</div>
          <div className="text-[11px] font-semibold text-[#1A1A1A]/75 truncate mt-0.5">
            {brandSubLabel}
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-[#1A1A1A] cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[61px] z-30 bg-[#FFE27A] border-b border-[#1A1A1A]/15 p-4 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeNavId;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold min-h-[44px] ${
                  isActive ? 'bg-white text-[#1A1A1A]' : 'text-[#1A1A1A]/85'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF5252] text-[#1A1A1A]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#1A1A1A]/15 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="py-2.5 px-3 rounded-xl bg-white/50 text-xs font-bold text-[#1A1A1A] min-h-[44px]"
            >
              Profile
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenExport();
              }}
              className="py-2.5 px-3 rounded-xl bg-white/50 text-xs font-bold text-[#1A1A1A] min-h-[44px]"
            >
              PHP/SQL
            </button>
            <button
              onClick={onLogout}
              className="py-2.5 px-3 rounded-xl bg-[#FF5252] text-xs font-bold text-[#1A1A1A] min-h-[44px]"
            >
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {topBanner}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

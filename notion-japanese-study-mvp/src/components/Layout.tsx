import type * as React from "react";
import type { Page } from "../App";
import { navItems, Sidebar } from "./Sidebar";

type LayoutProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
};

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-notion-bg text-notion-text">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">{children}</main>
      <MobileNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}

function MobileNav({ currentPage, onNavigate }: SidebarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-notion-border bg-[#fbfbfa]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_28px_rgba(15,15,15,0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.page || (currentPage === "quiz" && item.page === "questions");
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition ${
                active ? "bg-stone-800 text-white" : "text-notion-muted hover:bg-notion-soft"
              }`}
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{item.label === "Dashboard" ? "首頁" : item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

type SidebarProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

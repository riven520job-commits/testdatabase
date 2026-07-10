import type * as React from "react";
import { BookOpen, ClipboardList, Home, Plus, RotateCcw, Settings, XCircle } from "lucide-react";
import type { Page } from "../App";

type SidebarProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

export const navItems: Array<{ page: Page; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { page: "dashboard", label: "Dashboard", icon: Home },
  { page: "questions", label: "題庫", icon: BookOpen },
  { page: "form", label: "新增題目", icon: Plus },
  { page: "review", label: "今日複習", icon: RotateCcw },
  { page: "wrong", label: "錯題本", icon: XCircle },
  { page: "settings", label: "設定", icon: Settings }
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-notion-border bg-[#fbfbfa] px-4 py-5 lg:block">
      <div className="mb-7 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-800 text-sm font-semibold text-white">
          日
        </div>
        <div>
          <div className="text-sm font-semibold text-notion-text">日文學習題庫</div>
          <div className="text-xs text-notion-muted">Personal MVP</div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                active ? "bg-notion-soft font-medium text-notion-text" : "text-notion-muted hover:bg-notion-soft"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-notion-border bg-white p-4 text-xs leading-5 text-notion-muted">
        <div className="mb-2 flex items-center gap-2 font-medium text-notion-text">
          <ClipboardList size={15} />
          Local first
        </div>
        題庫會保存在此裝置；登入後可與手機或電腦雙向同步。
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen bg-neutral-900 border-r border-neutral-800">
      <div className="px-4 py-4 border-b border-neutral-800">
        <span className="text-sm font-semibold text-neutral-100 tracking-tight">
          Multi-Agent Runner
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {/* Navigation items can go here */}
      </nav>

      <div className="px-4 py-3 border-t border-neutral-800 flex items-center justify-between">
        <span className="text-xs text-neutral-500">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

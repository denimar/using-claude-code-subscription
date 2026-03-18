"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, ChevronLeft, ChevronRight, LayoutDashboard, ListTodo, Settings, Zap } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="size-4 shrink-0" />,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: <ListTodo className="size-4 shrink-0" />,
  },
  {
    label: "Agents",
    href: "/agents",
    icon: <Zap className="size-4 shrink-0" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="size-4 shrink-0" />,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-neutral-950 border-r border-neutral-800 transition-all duration-200 ease-in-out",
        collapsed ? "w-14" : "w-52"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 px-3 py-4 border-b border-neutral-800",
        collapsed && "justify-center px-0"
      )}>
        <div className="size-7 rounded bg-yellow-400 flex items-center justify-center shrink-0">
          <Bot className="size-4 text-neutral-950" />
        </div>
        {!collapsed && (
          <span className="font-mono text-xs font-semibold text-yellow-400 tracking-widest uppercase truncate">
            AgentRunner
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded text-sm transition-colors duration-100",
                collapsed && "justify-center px-0",
                active
                  ? "bg-yellow-400 text-neutral-950 font-semibold"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              )}
            >
              {item.icon}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center justify-center h-10 border-t border-neutral-800 text-neutral-500 hover:text-yellow-400 hover:bg-neutral-900 transition-colors duration-100"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </button>
    </aside>
  );
}

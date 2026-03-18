"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, Wifi, WifiOff, Loader2 } from "lucide-react";

type SessionStatus = "checking" | "connected" | "disconnected";

export function AppToolbar() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/cookies");
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        if (!cancelled) {
          setSessionStatus(data.exists ? "connected" : "disconnected");
        }
      } catch {
        if (!cancelled) setSessionStatus("disconnected");
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Bot className="size-5 text-primary" />
            <span className="font-semibold text-sm tracking-tight">
              Multi-Agent Runner
            </span>
          </div>
          <SessionBadge status={sessionStatus} />
        </div>
      </div>
    </header>
  );
}

function SessionBadge({ status }: { status: SessionStatus }) {
  if (status === "checking") {
    return (
      <Badge variant="secondary" className="gap-1.5 text-xs">
        <Loader2 className="size-3 animate-spin" />
        Checking session…
      </Badge>
    );
  }
  if (status === "connected") {
    return (
      <Badge variant="secondary" className="gap-1.5 text-xs text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
        <Wifi className="size-3" />
        Session active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1.5 text-xs text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
      <WifiOff className="size-3" />
      No session — open browser to log in
    </Badge>
  );
}

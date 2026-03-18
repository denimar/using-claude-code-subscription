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
    <header className="sticky top-0 z-50 w-full border-b border-yellow-400 bg-yellow-400 backdrop-blur supports-[backdrop-filter]:bg-yellow-400/90">
      <div className="px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Bot className="size-5 text-yellow-900" />
            <span className="font-semibold text-sm tracking-tight text-yellow-900">
              Stacktalk
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
      <Badge variant="secondary" className="gap-1.5 text-xs bg-yellow-200 text-yellow-800 border-yellow-300">
        <Loader2 className="size-3 animate-spin" />
        Checking session…
      </Badge>
    );
  }
  if (status === "connected") {
    return (
      <Badge variant="secondary" className="gap-1.5 text-xs text-emerald-700 bg-emerald-100 border-emerald-300">
        <Wifi className="size-3" />
        Session active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1.5 text-xs text-amber-700 bg-amber-100 border-amber-300">
      <WifiOff className="size-3" />
      No session — open browser to log in
    </Badge>
  );
}

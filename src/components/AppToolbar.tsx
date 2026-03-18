"use client";

import React from "react";

interface AppToolbarProps {
  children?: React.ReactNode;
}

export function AppToolbar({ children }: AppToolbarProps) {
  return (
    <div className="w-full bg-yellow-400 px-4 py-3 flex items-center gap-4 shadow-sm">
      {children}
    </div>
  );
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server at http://localhost:3000
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Architecture

This is a **Next.js 16** app using the **App Router** with React 19 and TypeScript 5.

- **Source code** lives in `src/app/` (file-based routing)
- **Path alias:** `@/*` maps to `./src/*`
- **Styling:** Tailwind CSS v4 via PostCSS, with CSS variables for dark/light themes in `src/app/globals.css`
- **Fonts:** Geist Sans and Geist Mono loaded via `next/font/google`
- **ESLint:** v9 flat config extending `next/core-web-vitals` and `next/typescript`
- **TypeScript:** strict mode enabled, target ES2017
- **UI Components:** shadcn/ui (base-nova style, neutral base color, Lucide icons). Add components via `npx shadcn@latest add <component>`. Components go to `src/components/ui/`, utilities in `src/lib/utils.ts`.

## Multi-Agent Runner

This app is a **multi-agent coding runner** that launches parallel Claude agents via Playwright browser automation against a claude.ai subscription session.

### Key modules
- `src/lib/types.ts` — Shared types (Task, Agent, AgentLog)
- `src/lib/store.ts` — In-memory task/agent store
- `src/lib/playwrightRunner.ts` — Playwright automation with persistent browser session to send prompts to claude.ai and extract responses
- `src/lib/runAgent.ts` — Agent orchestration (creates agents with different roles, runs them in parallel)
- `src/app/api/tasks/route.ts` — POST to create task + launch agents, GET to list tasks
- `src/app/api/tasks/[id]/route.ts` — GET single task with agent status
- `src/app/api/cookies/route.ts` — Check if persistent session exists
- `src/components/TaskInput.tsx` — Task description input form
- `src/components/AgentPanel.tsx` — Agent status card with logs, output, and code blocks
- `src/components/CodeViewer.tsx` — Code block renderer

### Session management
- Uses Playwright's **persistent browser context** stored in `.claude-session/`
- **First run:** browser opens in headed mode, user logs in manually, session is saved automatically
- **Subsequent runs:** browser launches headless using saved session, no login needed
- **Session reset:** delete the `.claude-session/` directory and restart
- Install Playwright browsers: `npx playwright install chromium`

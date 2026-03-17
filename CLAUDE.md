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

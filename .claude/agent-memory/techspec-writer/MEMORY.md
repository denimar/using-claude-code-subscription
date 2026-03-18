# Tech Spec Writer Memory

## Project Architecture Patterns
- Server Actions in `src/app/actions/` follow pattern: `"use server"`, import prisma, define response interfaces, export async functions with try/catch and structured error logging
- Prisma singleton at `src/db/prisma.ts` uses PrismaPg adapter with `globalForPrisma` pattern
- Zustand stores in `src/stores/` use `create<StateInterface>((set, get) => ({...}))` pattern
- Pages are minimal (e.g., `page.tsx` just renders a component)
- Polling: 5-second interval via `useBoardPolling` hook
- No existing auth -- User model exists but no sessions, login pages, or current-user mechanism
- Actions use Prisma `select` objects (not `include`) for explicit field selection

## Key File Locations
- Schema: `prisma/schema.prisma` (Agent, Task, User, Project models, enums TaskType/TaskStatus)
- Seed: `prisma/seed.ts`, data in `prisma/seed-data.ts` (5 seeded users, 9 agents)
- Actions: `src/app/actions/board-action.ts`, `agents-action.ts`, `projects-action.ts`
- Stores: `src/stores/board-store.ts`, `agent-store.ts`, `project-store.ts`, `theme-store.ts`
- Layout: `src/app/layout.tsx` (ThemeProvider wrapper, fonts: Syne, Outfit, Geist Mono)
- TaskDetailSidebar: `src/app/components/task-detail-sidebar.tsx` (~313 lines, inline ProjectDropdown)

## Next.js 16 Notes
- `middleware.ts` is renamed to `proxy.ts` in Next.js 16 (deprecated, will be removed)
- `proxy.ts` runs on Node.js runtime (NOT Edge), so Prisma DB calls work directly

## Dependencies Already in Use
- next 16.1.6, react 19.2.3, zustand 5, prisma 7, @prisma/adapter-pg, motion, @dnd-kit, pg
- Dev: jest 30, @testing-library/react, playwright, tailwindcss 4, ts-jest
- react-markdown 10, remark-gfm 4, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner already installed

## Conventions
- DB columns use snake_case via `@map()`, TypeScript uses camelCase
- Models use `@@map("table_name")` for table names (plural, snake_case)
- UUIDs as primary keys via `@default(uuid())`
- `createdAt`/`updatedAt` pattern on all models
- Relations use explicit `@relation` with named relations (e.g., `"AssignedTasks"`, `"ProjectTasks"`)
- Dev server runs on port 3009
- Target: tablet and desktop (min 768px)
- Tailwind CSS variables: `var(--bg-surface)`, `var(--text-primary)`, `var(--border-medium)`, etc.
- Header font: `var(--font-syne)`

## Task Comments Tech Spec (completed)
- Written to `tasks/prd-task-comments/techspec.md`
- Key decisions: polymorphic author enum, client-generated UUID for S3 paths, presigned URL uploads, react-markdown + remark-gfm, custom @mention, dedicated Zustand store, hardcoded first user as author stub

## Task Pipeline Automation Tech Spec (completed)
- Written to `tasks/prd-task-pipeline-automation/techspec.md`
- Key decisions: structured JSON envelope for clarification detection, API route for background generation, @anthropic-ai/sdk, comment-store polling, [ERROR] prefix for error comments, processing indicator derived from status+assignee role
- Comment model gains optional `attachment` text field for long-form deliverables
- New files: `/api/pipeline/generate/route.ts`, `pipeline-action.ts`
- Fire-and-forget pattern: non-awaited fetch with .catch() for error logging
- Comment store now needs polling (startPolling/stopPolling) when sidebar is open
- Dependencies: react-markdown and remark-gfm ARE already installed (correcting earlier note)
- Also: @aws-sdk/client-s3, @aws-sdk/s3-request-presigner already installed

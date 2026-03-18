# Task Planner Memory

## Project Patterns

### Store Pattern (Zustand)
- Stores live in `src/stores/` with `use<Name>Store` export
- Created with `create<Interface>((set, get) => ({...}))`
- Tests in `src/stores/__tests__/` mock Server Actions with `jest.mock`
- Use `useStore.setState()` in beforeEach, `useStore.getState()` for assertions

### Server Action Pattern
- Files in `src/app/actions/` with `"use server"` directive
- Export interfaces alongside functions (e.g., `TaskResponse`, `AgentResponse`)
- Error handling: try/catch with `console.error("descriptive message", { structured context })` then re-throw
- Tests in `src/app/actions/__tests__/` mock `@/db/prisma` default export with `jest.mock`

### Prisma Pattern
- Singleton in `src/db/prisma.ts` using PrismaPg adapter
- Schema uses `@map("snake_case")` for columns, `@@map("table_name")` for tables
- Generated client at `src/generated/prisma/client`

### Component Pattern
- Components in `src/app/components/`, sub-features in subdirectories (e.g., `comments/`)
- Client components use `"use client"` directive
- Styling: Tailwind only, CSS variables for theming (e.g., `var(--text-primary)`, `var(--bg-surface)`)
- Tests in `__tests__/` subdirectory alongside components

### Test Pattern
- Jest + @testing-library/react for unit tests
- Playwright for E2E in `e2e/` directory
- AAA pattern, independent tests, descriptive names
- Mock pattern: `jest.fn<() => Promise<Type>>()` for typed mocks

## Task Planning Conventions
- Max 10 tasks, sequential dependencies for data->backend->frontend->E2E flow
- Prisma schema changes always Task 1 (foundation)
- E2E tests always last task (requires all UI complete)
- Each task references specific design.md sections for visual specs
- Test subtasks are within each main task, not separate
- Templates at `templates/tasks-template.md` and `templates/task-template.md`
- Task files: `tasks/prd-[feature]/tasks.md` (summary) + `N_task.md` (individual)
- Template uses `<critical>` and `<requirements>` XML tags

## Codebase Size Reference
- `task-detail-sidebar.tsx`: ~307 lines (near 300-line limit, needs refactoring on additions)
- `task-card.tsx`: ~225 lines, uses motion/react for animations
- `comment-item.tsx`: ~102 lines, has room for additions
- `comment-store.ts`: ~50 lines, has `currentTaskId` short-circuit in fetchComments
- `board-action.ts`: Uses `taskSelect` const for reusable Prisma select objects
- Agent roles stored as unique strings, queried via `findFirst({ where: { role: "..." } })`

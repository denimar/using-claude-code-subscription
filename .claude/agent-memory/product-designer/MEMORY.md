# Product Designer Agent Memory

## Project Architecture
- Root route (`/`) renders `KanbanBoard` component — the main dashboard
- Layout: sidebar (256px, left) + header + main content area (5 Kanban columns)
- Full-screen `h-screen` layout with `atmosphere` class for ambient orb effects
- `bg-grid-pattern` dot grid used in main content area for depth

## Design System Tokens (see `src/app/globals.css`)
- Two themes: `midnight` (default dark) and `light`
- CSS custom properties for all colors: `--bg-primary`, `--bg-secondary`, `--bg-surface`, `--bg-elevated`, `--bg-hover`
- Border tokens: `--border-subtle`, `--border-medium`, `--border-bright`
- Text hierarchy: `--text-primary`, `--text-secondary`, `--text-muted`
- Accent: `--accent-primary` (sky blue), `--accent-secondary`, `--accent-warm` (amber)
- Fonts: Syne (display/headings), Outfit (body), Geist Mono (mono)
- Animations: `skeleton-shimmer`, `sidebar-slide-in`, `status-pulse`, `orb-drift`, `comment-fade-in`

## Component Patterns
- Cards: `rounded-[10px]`, `border border-[var(--border-subtle)]`, gradient backgrounds
- Agent avatar: 32px (sidebar/comments), 16px (task card), rounded-lg, with color fallback initial
- Status colors: todo=#818cf8, waiting_approval=#fbbf24, in_progress=#38bdf8, qa=#f97316, done=#34d399
- Type badges: uppercase, 9.5px, semibold, with colored bg/text
- Labels: `text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)]`
- Headings use `font-syne` via inline style
- Buttons: gradient primary, rounded-xl, with glow shadows
- Sidebar panels slide in from right with overlay backdrop-blur
- Comment left accent bar: 3px wide, agent color, rounded-full, absolute positioned

## Existing Components (with line counts)
- `task-card.tsx` — ~225 lines, animated card with accent bar, type badge, assignee
- `task-detail-sidebar.tsx` — ~307 lines (near 300-line limit, needs refactoring for new features)
- `comments/comment-item.tsx` — ~102 lines, individual comment with avatar, role badge, markdown body
- `comments/comment-thread.tsx` — ~83 lines, comment list with lightbox and empty/loading states
- `comments/markdown-body.tsx` — ReactMarkdown with remarkGfm, handles mentions, basic formatting
- `comments/comment-input.tsx` — comment input form
- `comments/image-lightbox.tsx` — image viewer overlay

## Data Model
- Agent: id, name, avatar, role, color, kanbanOrder, jobDescription, rules
- Task: id, title, description, type (bug/feature/task), status, assignee, projectId, createdAt
- Comment: id, body, authorType (user/agent), authorId, taskId, images[], createdAt
- Project: id, name, description, gitRepository
- User: id, name, email, avatar, role, active

## State Management
- `board-store`: tasks, agents, selectedAgentIds, selectedTaskId, loading, fetchBoard
- `comment-store`: comments, loading, submitting, currentTaskId, fetchComments, addComment, reset
- `project-store`: projects, selectedProjectId (persisted)
- `theme-store`: theme toggle (persisted)

## Key UX Patterns
- Short-polling every 5s for real-time updates
- Agent filter via sidebar toggles, stored in URL query params
- Tasks are read-only (no edit/delete from UI)
- New tasks auto-assigned to Product Manager
- Pulsing dot pattern: nested spans with animate-ping for attention indicators

## Established UI Patterns
- See `patterns.md` for modal, input, dropdown, tab, badge patterns

## Design Docs
- Task Comments: `tasks/prd-task-comments/design.md`
- Task Pipeline Automation: `tasks/prd-task-pipeline-automation/design.md`
  - Prototype: `tasks/prd-task-pipeline-automation/prototype.html`

## Playwright Screenshot Workflow
- Cannot use `file://` protocol -- must serve via HTTP (python3 -m http.server)
- Always close browser after screenshots
- Use element ref screenshots for section-specific captures

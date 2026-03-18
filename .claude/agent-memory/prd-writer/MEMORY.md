# PRD Writer Memory

## PRD Style Conventions (from existing PRDs)
- Use "FR-X.Y" numbering where X = feature group, Y = requirement number
- Keep Overview section to 2 short paragraphs max
- Objectives use bold labels followed by colon and description
- User stories grouped by persona (Primary, Secondary, Tertiary)
- Tables used for role/permission matrices and column definitions
- Out of Scope items use bold label followed by colon and explanation
- Tone: direct, professional, no fluff
- Title format: "PRD -- Feature Name"

## Project Personas
- **Owner**: Top-level admin, always exists, cannot be deleted
- **Member**: Can create tasks, interact with board
- **Viewer**: Read-only access to board

## Key Domain Facts
- Currently single-user, no auth system exists
- Kanban board is root route (`/`)
- Target: tablet + desktop (min 768px)
- Real-time: short-polling every 5s
- Tasks cannot be edited or deleted (backend-driven only)
- Comments are immutable (no edit/delete) -- consistent with tasks pattern
- PRD template at `templates/prd-template.md`
- Existing PRDs: kanban-board, agent-detail-page, projects-crud, task-comments, task-pipeline-automation
- Both Users and Agents can author comments (polymorphic authorship pattern)
- User model: id, name, email, avatar, role, active
- Agent model: id, name, avatar, role (unique), color, kanbanOrder, jobDescription, rules
- Project model supports soft delete (deletedAt)
- Task detail view: right-sliding sidebar (TaskDetailSidebar), max-w-2xl
- CSS variables for theming (--bg-primary, --accent-primary, etc.)
- S3 bucket "pipelord" for image storage

## Pipeline Automation Patterns
- Task pipeline: PM -> Tech Lead -> Product Designer -> Developers -> QA -> Done
- Status cycle per phase: todo -> waiting_approval (repeats per agent)
- AI uses Claude Opus 4.6, key in process.env.ANTHROPIC_API_KEY
- Agent jobDescription + rules used as system prompt
- Comment.attachment field for long-form AI content; body has short summary
- Collapsible/accordion UI for attachments
- Approval-only flow (no rejection yet)

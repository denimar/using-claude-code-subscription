# Product Manager Memory

## PRD Conventions
- Numbered functional requirements: FR-X.Y format
- Template: `templates/prd-template.md`
- Existing PRDs: `tasks/prd-*/prd.md`
- Save to: `tasks/prd-[feature-name]/prd.md`

## Domain Model
- Agents: AI agents with roles (PM, Tech Lead, QA, etc.)
- Tasks: work items on Kanban board (todo, waiting_approval, in_progress, qa, done)
- Projects: organizational grouping with soft-delete
- Users: human users with roles (owner, etc.)
- No user management/auth exists yet -- added in prd-user-management
- Three user roles defined: Admin, Member, Viewer
- Owner = permanent top-level Admin, cannot be deleted or disabled
- Comments: immutable, polymorphic authorship (User or Agent)
- Comment model has optional `attachment` field for long-form AI content

## Platform Constraints
- Tablet + desktop only (min 768px)
- Short-polling every 5s for real-time
- Invite-only access (no self-registration)
- S3 bucket "pipelord" for image storage

## Key Decisions
- Task comments use tab-based UI in TaskDetailSidebar: "Details" + "Comments (N)"
- Images: clipboard paste only (no drag-and-drop or file picker)
- S3 path: pipelord/task-comment-images/<task-id>/<comment-id>/<image-name>

## Pipeline Automation Decisions
- PRD phase: auto-approve if proper PRD; manual approve only for clarification questions
- Clarification detection: if Claude responds with questions instead of PRD, body-only comment (no attachment), status=waiting_approval
- Successful PRD: auto-approve -> reassign to Tech Lead -> todo -> trigger Tech Spec (no waiting_approval)
- Tech Spec phase: always requires manual user approval (waiting_approval)
- AI generation uses Claude Opus 4.6 via process.env.ANTHROPIC_API_KEY
- Agent's jobDescription + rules fields used as system prompt for AI calls
- Approval-only flow (no rejection); rejection deferred to future iteration
- Long AI content stored in Comment.attachment; body has short summary
- Collapsible/accordion UI for viewing attachments in comments
- Processing indicator derived from state (no new DB field needed if derivable)
- Status transitions: PRD success: todo -> todo (auto). Clarification: todo -> waiting_approval -> todo. Tech Spec: todo -> waiting_approval -> in_progress

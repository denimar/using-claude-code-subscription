# Established UI Patterns

## Modal Patterns
- Center modals: AnimatePresence, scale 0.95->1, overlay with backdrop-blur
- Side panels: sidebar-slide-in animation, right-aligned, max-w-2xl
- All modals: Escape to close, overlay click to close, overlayRef pattern
- Header: icon-in-gradient-bg (8x8 rounded-lg) + title (Syne font) + close button (X icon)
- Footer: Cancel (secondary, left) + Primary action (right), flex justify-end gap-3

## Input/Form Patterns
- Label: `text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)]`
- Input: `rounded-lg border border-[var(--border-medium)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm`
- Focus: `focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]`
- Error: `border-red-500/50` on input, `text-xs text-red-400` message below

## Dropdown Patterns
- Trigger: button with chevron rotating 180deg
- Container: `rounded-xl border border-[var(--border-medium)] bg-[var(--bg-elevated)]/95 shadow-2xl backdrop-blur-[24px]`
- Items: `px-3 py-2 text-sm hover:bg-[var(--bg-hover)]`
- Close: click-outside (mousedown), Escape key

## Tab Patterns
- Tab bar: `flex, border-bottom var(--border-subtle), px-6`
- Active: `text-[var(--text-primary)], border-b-2 border-[var(--accent-primary)]`
- Inactive: `text-[var(--text-muted)], hover text-[var(--text-secondary)]`
- Count badge: `bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] rounded-full px-1.5`

## Badge Patterns
- Approved: `bg-[#34d399]/10 text-[#34d399] text-[12px] rounded-md px-2.5 py-1` + checkmark icon
- Auto-approved: `bg-[var(--text-muted)]/10 text-[var(--text-muted)]` + lightning bolt icon
- Role badge: `rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider` with agent color bg/text

## Collapsible Section Pattern (new in pipeline automation)
- Toggle: ghost button with chevron rotating 0->90deg, `text-[13px] font-medium text-[var(--accent-primary)]`
- Container: `rounded-lg border border-[var(--border-medium)] bg-[var(--bg-surface)] p-4` with 2px agent-color top accent
- Aria: `aria-expanded` on toggle, `role="region"` on panel, `aria-controls`/`aria-labelledby` linking

## Processing Indicator Pattern (new in pipeline automation)
- Task card: pulsing dot (animate-ping) + `text-[9px] font-bold uppercase tracking-wider` in agent color
- Sidebar banner: CSS border-spinner (animate-spin) + `text-sm font-medium` in agent color
- Banner container: `bg-gradient-to-r from-[agentColor]/5 to-transparent`, `role="status" aria-live="polite"`

## Error Comment Pattern (new in pipeline automation)
- Left accent bar: #F97316 (orange) instead of agent color
- Warning triangle icon (14px) next to agent name
- Retry button: secondary style `border border-[var(--border-medium)] bg-[var(--bg-surface)]`

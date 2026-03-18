---
name: Prisma client cache requires dev server restart
description: After prisma generate or schema changes, the Next.js dev server must be restarted to pick up the new Prisma client - hot reload alone is insufficient
type: project
---

After running `prisma generate` or applying schema changes, the Next.js dev server caches the old Prisma client via the globalThis singleton pattern in `src/db/prisma.ts`. Simply running `prisma generate` is not enough - the dev server process must be killed and restarted for the new client to take effect.

**Why:** The Prisma singleton is cached on `globalThis.prisma` and survives HMR. Server actions will fail with cryptic "Invalid model" errors if the cached client doesn't match the schema.

**How to apply:** After any `prisma migrate dev` or `prisma generate`, kill and restart the dev server before testing. Clear `.next` cache if needed.

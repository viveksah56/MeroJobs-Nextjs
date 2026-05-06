<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
- App Router files live in `src/app/` (`layout.tsx`, `page.tsx`, `not-found.tsx`); there is no `pages/` directory in this repo.
- Use the `@/*` alias for imports from `src/` (for example `@/lib/utils` and `@/components/ui/button`).
- Shared UI primitives follow the shadcn/base-ui pattern in `src/components/ui/`; `src/components/ui/button.tsx` shows the local `cva` + `cn()` variant approach.
- Tailwind v4 is wired through `src/app/globals.css` with `@import "tailwindcss"`, `tw-animate-css`, and `shadcn/tailwind.css`; keep theme tokens and dark-mode variables there.
- Keep root layout concerns in `src/app/layout.tsx`; it currently owns `Metadata` and `next/font/google` font variables.
- Use `npm run lint` for checks and `npm run build` to verify production output.
<!-- END:nextjs-agent-rules -->

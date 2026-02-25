# Mudralaya Project Guidelines

## Code Style

- **Client Components**: Always use `"use client"` directive for interactive components with hooks/events
- **Component Pattern**: Direct function components (no FC type), see [Hero.tsx](src/components/Home/Hero.tsx)
- **Imports**: CSS modules as `styles`, path alias `@/` for src imports, contexts via `@/context/`
- **CSS Approach**: CSS Modules only (NO Tailwind classes in components) - each component has paired `.module.css` file
- **Naming**: CSS classes use camelCase (`.navLinks`, `.primaryBtn`), leverage CSS variables from [globals.css](src/app/globals.css)

## Architecture

- **Next.js 16 App Router**: Pages in `src/app/` using `page.tsx` convention
- **State Management**: Context-based via [AuthContext](src/context/AuthContext.tsx) and [UIContext](src/context/UIContext.tsx) - no prop drilling
- **Modal System**: Modals rendered in [LayoutWrapper.tsx](src/components/LayoutWrapper.tsx), controlled globally via `useUI()` hooks (e.g., `openJoinUsModal()`)
- **Layout Hierarchy**: AuthProvider → UIProvider → Header/Footer wrap all pages in [layout.tsx](src/app/layout.tsx)

## Build and Test

```bash
npm run dev      # Development server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

## Project Conventions

- **Component Structure**: Each component folder contains `ComponentName.tsx` + `ComponentName.module.css`
- **Page Composition**: Pages import and compose section components (see [page.tsx](src/app/page.tsx) → Hero, WhyJoin, etc.)
- **Forms**: Submit to Supabase edge functions via `supabase.functions.invoke("forms-api")` - handle loading/error states locally
- **Images**: Use Next.js `<Image>` with explicit width/height, WebP format preferred, `priority` for above-fold content
- **Animation**: framer-motion with `<AnimatePresence>` for modals/transitions, `<motion.div>` for scroll animations
- **Icons**: lucide-react library (e.g., `<Menu>`, `<X>`, `<ArrowRight>`)

## Integration Points

- **Supabase** ([lib/supabase.ts](src/lib/supabase.ts)): Primary backend for auth (phone OTP) and database, custom cookie storage for cross-subdomain sessions
- **Auth Flow**: Phone OTP → `signInWithOtp()` → `verifyOtp()` → Redirect to `user.mudralaya.com` dashboard
- **Razorpay**: Payment gateway (preconnected in [Preconnect.tsx](src/components/Preconnect.tsx))
- **External Dashboard**: Separate app at `user.mudralaya.com` (post-login redirect)

## Security

- Phone-based authentication only (no email/password)
- Supabase session management with custom cookie storage for `mudralaya.com` domain
- No sensitive keys in client code - use Supabase environment variables

## Design System

- **Typography**: Roboto (body) + Montserrat (headings) via Google Fonts in [layout.tsx](src/app/layout.tsx)
- **Colors**: Blue/slate palette - `--primary: #2563eb`, `--foreground: #0f172a`
- **Spacing**: Use CSS variables (`--spacing-unit`, `--radius-lg`)
- **Responsive**: Mobile-first, hamburger menu pattern in [Header](src/components/Header/Header.tsx)

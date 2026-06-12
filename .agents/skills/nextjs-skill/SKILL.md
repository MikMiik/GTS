---
name: nextjs-skill
description: Next.js frontend project structure and implementation guidance for App Router applications. Use when an agent needs to create, review, refactor, or extend a Next.js frontend project with src/app routing, optional localized routes, route groups, domain components, services, schemas, types, hooks, providers, and shared UI conventions.
---

# Next.js Skill

## Application Order

Apply this skill in order. Do not jump to providers, auth state, or i18n files before the routing choices are clear.

1. Detect existing project conventions first: routing mode, route groups, providers, stores, services, and component folders.
2. Ask whether the project needs i18n when no existing i18n convention is clear.
3. If i18n is enabled, apply `i18n-skill` before finalizing the route tree.
4. Ask whether the project needs a separate `(auth)` route group when no existing auth convention is clear.
5. If `(auth)` is enabled, ask whether auth should use global state with Zustand before creating any store or auth provider.
6. Create the folder structure based on those answers.
7. Add provider wrappers in the root layout only after the selected providers are known.
8. Design pages with Server Components first, then split Client Components only where interactivity requires them.
9. Add services, shared types, route-local `type.ts`, schemas, hooks, and components according to the placement rules.
10. Do not create Next.js API routes or Server Actions for this frontend structure. Backend calls should go through `src/services` and shared request utilities.
11. Leave SEO-specific work to the separate SEO skill.

## Related Skills

Use these skills as references when the task reaches their scope:

- `next-best-practices`: apply for App Router file conventions, Server Component boundaries, async `params/searchParams`, error boundaries, image/font guidance, and general Next.js correctness.
- `next-cache-components`: apply for Next.js 16 Cache Components, `use cache`, `cacheLife`, `cacheTag`, `updateTag`, Partial Prerendering, and static/dynamic composition.
- `i18n-skill`: apply only when the user wants multilingual routing or the project already uses i18n.
- `react-hook-form-zod`: apply when building forms with React Hook Form and Zod validation. If a request says `react-hook-form-zed`, treat it as this skill unless a separate skill exists.

## Routing Mode Question

Before applying a folder structure that contains `src/app/[locale]`, ask the user:

```text
Does the project require multilingual configuration (i18n)?
```

- If the answer is no, do not create `src/app/[locale]`. Put routes directly under `src/app`, and omit `src/i18n`, `src/messages`, and i18n-specific middleware/proxy config.
- If the answer is yes, use the i18n-enabled structure with `src/app/[locale]`, add `src/i18n`, add `src/messages`, configure the i18n middleware/proxy, and apply `i18n-skill`.
- If the project already has i18n files, infer the existing convention from the codebase before asking. Ask only when the intended direction is unclear.

After the i18n decision, ask the user:

```text
Does the project need a separate authentication route group such as `(auth)` for login, register, forgot password, or reset password pages?
```

- If the answer is yes, create `(auth)` for authentication pages and `(main)` for the main application pages.
- If the answer is no, do not create `(auth)`. Use only `(main)` for page routes unless another route group is required by layout needs.
- If the project already has authentication routes, infer the existing route group convention from the codebase before asking. Ask only when the intended direction is unclear.

If the user agrees to use `(auth)`, ask one more question before configuring global auth state:

```text
Should authentication use global state with Zustand?
```

- If the answer is yes, install/use `zustand`, create `src/store/authStore.ts`, create an auth provider component, and wrap the main layout with that provider.
- If the answer is no, do not create `src/store/authStore.ts` and do not add an auth provider wrapper to the main layout.
- If the project already has a global auth store, follow the existing store and provider conventions.

## Standard Project Structure

Use this structure as the default target when creating or refactoring a multilingual Next.js App Router project. Keep feature code grouped by domain, keep route files thin, and place reusable implementation details under `src/`.

```text
project-root/
|-- public/
|   |-- images-and-static-files
|   +-- favicon-or-brand-assets
|-- src/
|   |-- app/
|   |   |-- [locale]/
|   |   |   |-- (auth)/                 # optional; only when auth pages need a separate route group
|   |   |   |   |-- login/page.tsx
|   |   |   |   |-- register/page.tsx
|   |   |   |   |-- forgot-password/page.tsx
|   |   |   |   |-- reset-password/page.tsx
|   |   |   |   |-- verify-email/page.tsx
|   |   |   |   +-- request-success/page.tsx
|   |   |   |-- (main)/
|   |   |   |   |-- layout.tsx
|   |   |   |   |-- page.tsx
|   |   |   |   |-- about/page.tsx
|   |   |   |   |-- contact/page.tsx
|   |   |   |   |-- account/
|   |   |   |   |   |-- layout.tsx
|   |   |   |   |   |-- my-profile/page.tsx
|   |   |   |   |   |-- about-me/page.tsx
|   |   |   |   |   |-- password/page.tsx
|   |   |   |   |   +-- delete-account/page.tsx
|   |   |   |   |-- blog/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   +-- [slug]/
|   |   |   |   |       |-- page.tsx
|   |   |   |   |       +-- type.ts
|   |   |   |   |-- locations/
|   |   |   |   |   |-- page.tsx
|   |   |   |   |   +-- [id]/
|   |   |   |   |       |-- page.tsx
|   |   |   |   |       +-- not-found.tsx
|   |   |   |   +-- feature-routes/
|   |   |   |       |-- page.tsx
|   |   |   |       |-- type.ts
|   |   |   |       +-- [id-or-slug]/page.tsx
|   |   |   |-- error.tsx
|   |   |   |-- globals.css
|   |   |   |-- layout.tsx
|   |   |   |-- loading.tsx
|   |   |   |-- not-found.tsx
|   |   |   +-- page.tsx
|   |   +-- favicon.ico
|   |-- assets/
|   |   +-- images/
|   |-- components/
|   |   |-- ui/
|   |   |-- layout/
|   |   |   |-- ThemeMenu.tsx
|   |   |   +-- ToasterClient.tsx
|   |   |-- common/
|   |   |   |-- Filter.tsx
|   |   |   +-- SearchBar.tsx
|   |   |-- other/
|   |   |   |-- LanguageSwitcher.tsx
|   |   |   +-- UserProvider.tsx
|   |   +-- feature-domain/
|   |-- hooks/
|   |   +-- use-feature.ts
|   |-- i18n/
|   |   |-- navigation.ts
|   |   |-- request.ts
|   |   +-- routing.ts
|   |-- lib/
|   |   +-- utils.ts
|   |-- messages/
|   |   |-- en.json
|   |   +-- vi.json
|   |-- providers/
|   |   +-- ThemeProvider.tsx
|   |-- schemas/
|   |   +-- featureSchema.ts
|   |-- services/
|   |   +-- featureService.ts
|   |-- store/
|   |   +-- authStore.ts
|   |-- types/
|   |   +-- feature.ts
|   |-- utils/
|   |   |-- fetchApi.ts
|   |   |-- httpRequest.ts
|   |   +-- safeParse.ts
|   +-- proxy.ts
|-- .env.example
|-- .eslintrc.json
|-- .gitignore
|-- components.json
|-- next-env.d.ts
|-- next.config.js
|-- package.json
|-- postcss.config.js
|-- README.md
+-- tsconfig.json
```

## Placement Rules

- Put route-owned files in `src/app`: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and route-local `type.ts`.
- Use route groups to organize layouts without changing URL paths. Create `(auth)` only when the project has authentication pages that need a separate layout or grouping; otherwise use `(main)` only.
- Put locale-specific pages under `src/app/[locale]` only when the user wants multilingual routing or the existing project already uses i18n.
- Keep `page.tsx` focused on routing, data orchestration, and composition. Move reusable UI to `src/components`.
- Put generic design-system components in `src/components/ui`, layout shell components in `src/components/layout`, shared app widgets such as `Filter.tsx` and `SearchBar.tsx` in `src/components/common`, and domain components in `src/components/<domain>`.
- Put API client modules and backend integration calls in `src/services`.
- Do not create `src/app/api` or `route.ts` API handlers for this frontend structure.
- Do not create Server Actions or route-level `action.ts/actions.ts` files for mutations. Use client-side mutation tools according to the data rules below.
- Put shared TypeScript types in `src/types`.
- When a page calls an API and needs types only for that route/API response, create `type.ts` in the same folder as the `page.tsx` that performs or orchestrates the API call.
- Put validation schemas in `src/schemas`, usually one file per form or request boundary.
- Do not create a `src/data` folder in the shared structure.
- Put reusable hooks in `src/hooks`; use `use-*.ts` for non-JSX hooks and `use-*.tsx` only when JSX is required.
- Put i18n routing helpers in `src/i18n` and translation messages in `src/messages` only when multilingual routing is enabled.
- Put static browser-served assets in `public`; put imported source assets in `src/assets`.
- Do not add SEO-specific layout wrappers, JSON-LD, analytics, sitemap rules, or metadata strategy here. Keep SEO guidance in a separate SEO skill.

## Page Design Workflow

Use this flow when designing or implementing a page:

1. Start with `page.tsx` as a Server Component by default.
2. Prefer SSG or Incremental Static Regeneration for public pages. Use static rendering, cached `fetch`, `revalidate`, or Cache Components depending on the Next.js version and project config.
3. Reference `next-best-practices` for App Router rules, RSC boundaries, async params/searchParams, and error/loading conventions.
4. Reference `next-cache-components` when the project uses Next.js 16 Cache Components or needs Partial Prerendering with mixed static, cached, and dynamic sections.
5. Build static sections directly as Server Components first: header, hero, intro sections, content blocks, cards, grids, FAQ display, and other non-interactive UI.
6. When a section needs browser state or event handlers, split that part into a Client Component under `src/components/<page-or-domain>/`.
7. Split Client Components before splitting additional Server Components. After interactive parts are isolated, split long static page sections into smaller Server Components if the page is too large.
8. Keep route-owned response types beside the route in `type.ts`; move only reused types to `src/types`.
9. Keep backend calls in `src/services` and request helpers in `src/utils`; do not use Server Actions for this frontend structure.

Common split points that should become Client Components:

- Forms
- Filters
- Search boxes
- Sort controls
- Tabs with client state
- Modals, drawers, popovers, and lightboxes
- Pagination or infinite loading controlled in the browser
- Components using `useState`, `useEffect`, browser APIs, or event handlers

For forms, apply `react-hook-form-zod` and put validation schemas in `src/schemas`.

For filters and search, reuse `src/components/common/Filter.tsx` and `src/components/common/SearchBar.tsx` after project setup. Customize their props and styling for the domain instead of duplicating one-off filter/search components.

For mutations:

- If auth is enabled, prefer `axios` so the project can centralize base URL, credentials, refresh-token logic, and interceptors.
- If auth is not needed, React Query mutations are often a better fit for client-side create/update/delete flows.
- Keep mutation hooks or client-side mutation logic inside the relevant Client Component or a nearby hook. Keep API call primitives in `src/services`.

## Starter File Templates

Reusable starter files live in `assets/starter-files`. Copy only the files that match the user's selected options and then adapt names, API paths, UI text, and domain types to the target project.

Always-available frontend utility templates:

- `assets/starter-files/src/types/api.ts`
- `assets/starter-files/src/utils/fetchApi.ts`
- `assets/starter-files/src/utils/httpRequest.ts`
- `assets/starter-files/src/utils/safeParse.ts`
- `assets/starter-files/src/lib/utils.ts`
- `assets/starter-files/src/hooks/useDebounce.ts`
- `assets/starter-files/src/components/common/Filter.tsx`
- `assets/starter-files/src/components/common/SearchBar.tsx`

Theme and toast templates:

- `assets/starter-files/src/providers/ThemeProvider.tsx`
- `assets/starter-files/src/components/layout/ThemeMenu.tsx`
- `assets/starter-files/src/components/layout/ToasterClient.tsx`

i18n-only template:

- `assets/starter-files/src/components/other/LanguageSwitcher.tsx`

Auth + Zustand-only templates:

- `assets/starter-files/src/types/auth.ts`
- `assets/starter-files/src/store/authStore.ts`
- `assets/starter-files/src/services/authService.ts`
- `assets/starter-files/src/components/other/UserProvider.tsx`

Dependency notes:

- `httpRequest.ts` requires `axios`.
- `ThemeProvider.tsx` and `ThemeMenu.tsx` require `next-themes`.
- `ToasterClient.tsx` requires `sonner`.
- `authStore.ts` requires `zustand`.
- `Filter.tsx`, `SearchBar.tsx`, `ThemeMenu.tsx`, and `LanguageSwitcher.tsx` assume shadcn UI components already exist.

## Main Layout Providers

Configure only the providers that the user selected or the existing project already uses. Keep providers as small client components and compose them in the root layout.

Always include hydration warnings when using client-side theme or persisted client state:

```tsx
<html lang={localeOrDefault} suppressHydrationWarning>
  <body suppressHydrationWarning>{children}</body>
</html>
```

Use `lang={locale}` when i18n is enabled. Use a fixed default such as `lang="en"` or the project's default language when i18n is not enabled.

Provider rules:

- Add `NextIntlClientProvider` only when the user wants i18n or the project already uses `next-intl`; keep the full setup in `i18n-skill`.
- Use `assets/starter-files/src/components/other/LanguageSwitcher.tsx` only when i18n is enabled.
- Use `assets/starter-files/src/providers/ThemeProvider.tsx` and `assets/starter-files/src/components/layout/ThemeMenu.tsx` when the project needs theme switching or dark mode.
- Use `assets/starter-files/src/components/layout/ToasterClient.tsx` when the project needs toast rendering.
- Use the auth + Zustand starter files only when `(auth)` is enabled and the user agrees to global auth state with Zustand.
- Keep `UserProvider` inside `ThemeProvider` and inside `NextIntlClientProvider` when all selected providers are enabled.
- Omit `NextIntlClientProvider` when i18n is disabled. Omit `UserProvider` when auth Zustand state is disabled.

## Non-i18n Adjustment

When the user does not want multilingual support, flatten the route tree:

```text
src/
|-- app/
|   |-- (auth)/        # optional; omit when auth grouping is not needed
|   |   |-- login/page.tsx
|   |   |-- register/page.tsx
|   |   +-- forgot-password/page.tsx
|   |-- (main)/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- about/page.tsx
|   |   +-- feature-routes/
|   |       |-- page.tsx
|   |       +-- [id-or-slug]/page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   |-- loading.tsx
|   |-- error.tsx
|   |-- not-found.tsx
|   +-- page.tsx
+-- components/
```

Do not add `src/i18n`, `src/messages`, `NextIntlClientProvider`, `next-intl` plugin config, or `src/proxy.ts` for i18n unless another requirement needs them.

## Non-auth Adjustment

When the user does not need a separate authentication route group, omit `(auth)` and keep the app routes under `(main)`:

```text
src/
|-- app/
|   |-- (main)/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- about/page.tsx
|   |   |-- contact/page.tsx
|   |   +-- feature-routes/
|   |       |-- page.tsx
|   |       |-- type.ts
|   |       +-- [id-or-slug]/page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   |-- loading.tsx
|   |-- error.tsx
|   |-- not-found.tsx
|   +-- page.tsx
```

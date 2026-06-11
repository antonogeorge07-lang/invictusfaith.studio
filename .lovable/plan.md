# HiBob adaptation: full push

Shipping all four slices in one push. Heads-up: this is a large change touching design tokens, routing, two new admin sections, and two new public content systems. I'll keep each slice self-contained so anything can be reverted independently.

## 1. Visual polish + proof bar

- Editorial H1 scale: bump desktop `h1` to clamp(3rem, 7vw, 7.5rem), tighter tracking, single accent color discipline (drop stray emerald-300/400/500 mixes, use `--accent` token only).
- Hover micro-interactions: 2px lift + underline-draw on nav and card links via existing Framer Motion.
- Section rhythm: alternate `bg-background` / `bg-secondary` between Vision, MVPs, Samples, Pillars so the page stops feeling uniformly dark.
- Proof bar: new `LogoBar.tsx` rendered under `Hero`, pulls `studio_samples` rows where `published = true`, shows favicon + name in a marquee. Mid-page repeat above Contact.

## 2. Persona landing pages

Routes: `/for/founders`, `/for/small-business`, `/for/creators`.

- Single `PersonaPage.tsx` component takes a persona config (headline, subtext, pain points, recommended package, testimonial slot).
- Reuses Hero, Pillars, MVPShowcase, Contact with persona-specific copy injected.
- Added to navbar under a new "For" dropdown.

## 3. Insights blog CMS

Database (migration):
- `posts` table: slug (unique), title, excerpt, body_md, cover_url, status (draft/published), author_id, published_at, tags[].
- RLS: anyone reads `published`; staff (`is_staff`) full CRUD.
- GRANT select to anon for published reads, full CRUD to authenticated + service_role.

Frontend:
- `/insights` index page (grid of published posts).
- `/insights/:slug` detail page (markdown render via `react-markdown` already-or-add).
- Admin: new `InsightsBody.tsx` tab in `/admin` with list + create/edit form (title, slug, body markdown, cover upload to a new `insights` storage bucket, publish toggle).
- SEO: per-post `<Seo>` + JSON-LD Article schema.

## 4. Page-blocks CMS

Database (migration):
- `pages` table: slug (unique), title, status, seo_title, seo_description.
- `page_blocks` table: page_id FK, sort_order, block_type (hero|logo_bar|feature_split|testimonial|stats_row|cta|markdown), props jsonb.
- RLS: anyone reads blocks of published pages; staff full CRUD.

Frontend:
- `<DynamicPage>` route at `/p/:slug` that fetches page + blocks and renders a `BlockRenderer` switching on `block_type`.
- Block components live in `src/components/blocks/` (one file per type, ~7 files), each reads `props` and renders using existing design tokens.
- Admin: new `PagesBody.tsx` tab with page list, block list per page (drag-reorder with existing dnd from BoardBody), and a props editor (simple JSON form per block type for v1).

## Order of operations

1. Migration: `posts`, `pages`, `page_blocks` + storage bucket `insights` in one approval.
2. After approval lands and types regenerate: code for all four slices in parallel writes.
3. Update navbar, Console tabs, App routes, memory index.

## Technical notes

- New deps: `react-markdown`, `remark-gfm` for blog rendering.
- No edge functions needed; everything is client + RLS.
- No em-dashes; semantic tokens only; `translate="no"` already on root.
- The page-blocks admin in v1 uses a raw-JSON props editor per block to keep this single-push scope sane. Per-block form UIs can come later.

## Risks

- Big surface area: ~15 new files + 1 migration. If anything breaks the build, the whole push is blocked until fixed.
- Block-type schemas are frozen at v1; changing them later means data migration.
- The visual polish (alternating section backgrounds, H1 scale) is opinionated and may not match your taste on first try.

Approve and I'll start with the migration, then ship the rest in parallel writes.

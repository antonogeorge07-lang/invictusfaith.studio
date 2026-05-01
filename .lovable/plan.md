
# Phase 2 — Customer Communication, Quotes & Portal

Build a complete request-handling workflow: reply to customers from the admin, auto-notify them on status changes, send simple quotes they can accept or decline, and give every request a public tracking page.

## What you'll get

### 1. Reply thread (admin ↔ customer via email)
- New "Messages" tab inside the request drawer at `/admin/inbox`
- Owner / Admin / Designer can write a message → customer receives it by email from `noreply@invictusfaith.studio`
- Customer's email replies are captured (via inbound parsing or a "Reply" button in the email that opens their portal page) and shown in the same thread
- Internal "Notes" stay separate from customer-facing "Messages"

### 2. Status update emails
- Whenever a request is moved on the Kanban (`new` → `triaged` → `in_progress` → `waiting` → `done`), the customer automatically gets a branded email
- Each status has its own friendly copy ("Your idea is now in progress" etc.)
- Toggle in the drawer: "Notify customer on status changes" (on by default) so internal-only moves don't email

### 3. Simple quotes with Accept / Decline
- "Quotes" tab in the request drawer
- Quote = title + total amount (EUR by default) + optional notes
- "Send quote" → customer gets a styled email with two buttons: **Accept** / **Decline** (each is a unique signed link)
- Customer click updates quote status and posts a system message in the thread
- Quote status badges: Draft, Sent, Accepted, Declined, Expired

### 4. Public customer portal (no login)
- Every request gets a unique unguessable token at creation
- Public page at `/r/<token>` shows: status timeline, full message thread, quote(s), reply box
- Link is included in the original confirmation email and every status-update email
- Read + write scoped to that single request via the token (no auth needed for the customer)

## Permissions
All three roles (Owner, Admin, Designer) can send messages and quotes, per your selection.

---

## Technical Section (for reference)

### Database changes (one migration)
- `requests`: add `public_token uuid unique`, `notify_on_status_change boolean default true`
- New table `request_messages` (id, request_id, author_type ['staff'|'customer'|'system'], author_id nullable, body, created_at)
- New table `quotes` (id, request_id, title, total_cents int, currency text default 'EUR', notes, status enum ['draft','sent','accepted','declined','expired'], accept_token uuid, decline_token uuid, sent_at, responded_at, created_by, created_at, updated_at)
- Trigger on `requests` UPDATE OF status → enqueue status-change email if `notify_on_status_change`
- Backfill `public_token` for existing rows
- RLS:
  - `request_messages`: staff full access; anon SELECT/INSERT only via the portal edge function (server-side token check)
  - `quotes`: staff full access; anon read via portal edge function
- Realtime on `request_messages` and `quotes` for live admin updates

### Email infrastructure
- Already have email domain `notify.invictusfaith.studio` + auth-email-hook + queue
- Need to call `setup_email_infra` (idempotent) then `scaffold_transactional_email`
- Templates created (React Email, branded with #00FFAB / Poppins, white body):
  - `request-received` (replaces current send-contact-notification confirmation)
  - `request-status-update` (dynamic status copy)
  - `request-message` (new message from studio)
  - `quote-sent` (with Accept/Decline buttons)
  - `quote-response-confirmation` (after customer clicks)

### Edge functions
- `send-transactional-email` (scaffolded, used everywhere)
- `request-portal` — public GET/POST for `/r/<token>` (fetch thread + quotes, post customer message)
- `quote-respond` — public GET that handles accept/decline link clicks, redirects to portal page
- DB trigger → enqueues status-update email when status changes

### Frontend
- `src/pages/admin/Inbox.tsx` drawer: add tabs (Details / Messages / Quotes / Notes), message composer, quote builder, "Send" buttons
- `src/pages/admin/Board.tsx`: status change uses existing update path (trigger handles email)
- New `src/pages/RequestPortal.tsx` at route `/r/:token` — public, branded, mobile-first
- Update `src/components/Contact.tsx` confirmation flow to use new template
- Add portal link to all customer-facing emails

### Out of scope (future phases)
- PDF quote generation
- Itemized line items / tax / multi-currency
- Inbound email parsing (replies in this phase happen via the portal "Reply" button in the email; full inbound parsing is a later add)
- Stripe / payment collection on accepted quotes

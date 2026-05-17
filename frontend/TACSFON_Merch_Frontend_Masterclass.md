# 🎨 TACSFON Merch Store — Frontend Engineer Masterclass
**Role:** Frontend Engineer  
**Stack:** Next.js 14 (App Router), Tailwind CSS, Three.js (r128), Supabase Client, Vercel  
**Integrates with:** Backend API (Next.js API Routes), Supabase Realtime  
**Version:** 1.0  
**Status:** Pre-build spec — no code written yet

---

## 📌 Your Responsibility

You own everything the user sees and interacts with:
- All pages (student-facing and admin-facing)
- 3D product viewer (Three.js)
- Auth flows (Google + email/password)
- Cart UI and state management
- Order placement and payment proof upload
- Realtime notification UI
- Admin dashboard
- Receipt viewing and download
- Design system and component library

You do NOT write database schema or backend business logic. You consume the API the Backend engineer built and the Supabase Realtime the DB engineer configured.

---

## 🏗️ Architecture Overview

```
Next.js 14 — App Router
  /app
    /(public)             → Guest-accessible pages
    /(student)            → Auth-required student pages
    /(admin)              → Admin-only pages
    /api/auth/callback    → Google OAuth handler (backend handles this)

State Management:
  Server Components      → Data fetching (products, categories)
  Client Components      → Interactivity (cart, 3D viewer, notifications)
  Zustand                → Global client state (cart count, notifications)
  Supabase Realtime      → Live notification updates

Styling:
  Tailwind CSS           → Utility classes only
  CSS Variables          → Design tokens (colors, spacing)
  Framer Motion          → Animations and transitions
```

---

## 🎨 Design System

> Implement this design system in Phase 1 before building any page. Every page must use these tokens — no hardcoded colors or values anywhere.

### Color Tokens
```css
:root {
  /* Primary Palette */
  --color-bg:          #0A0A0F;   /* Midnight Black — page background */
  --color-surface:     #13131A;   /* Elevated surfaces — cards, modals */
  --color-surface-2:   #1C1C26;   /* Double-elevated — dropdowns, tooltips */
  --color-border:      #2A2A38;   /* Subtle borders */

  /* Accent */
  --color-gold:        #C9A84C;   /* Electric Gold — primary accent */
  --color-gold-light:  #E8C96A;   /* Gold hover state */
  --color-gold-muted:  #C9A84C26; /* Gold with 15% opacity — ghost backgrounds */

  /* Text */
  --color-text-primary:   #F7F5F0;  /* Warm Ivory — headings */
  --color-text-secondary: #A09C94;  /* Muted — body, labels */
  --color-text-disabled:  #4A4844;  /* Disabled states */

  /* Semantic */
  --color-success:     #2D9E6B;
  --color-error:       #D94F4F;
  --color-warning:     #E8A830;

  /* Glassmorphism */
  --glass-bg:          rgba(19, 19, 26, 0.7);
  --glass-border:      rgba(201, 168, 76, 0.15);
  --glass-blur:        blur(12px);
}
```

### Typography
```
Font Stack:
  Headings:  'Urbanist', sans-serif  (weights: 600, 700, 800)
  Body:      'Inter', sans-serif     (weights: 400, 500)

Load via next/font/google — never CDN link tags.

Scale:
  --text-xs:    0.75rem   / 12px
  --text-sm:    0.875rem  / 14px
  --text-base:  1rem      / 16px
  --text-lg:    1.125rem  / 18px
  --text-xl:    1.25rem   / 20px
  --text-2xl:   1.5rem    / 24px
  --text-3xl:   1.875rem  / 30px
  --text-4xl:   2.25rem   / 36px
  --text-5xl:   3rem      / 48px
  --text-6xl:   3.75rem   / 60px
```

### Spacing Rhythm
All spacing uses 4px base unit. Use Tailwind's default scale — do not invent custom spacing. Minimum touch target: 44px × 44px.

### Shadows & Elevation
```css
--shadow-sm:    0 1px 3px rgba(0,0,0,0.4);
--shadow-md:    0 4px 16px rgba(0,0,0,0.5);
--shadow-gold:  0 0 24px rgba(201,168,76,0.15);   /* glow on hover */
--shadow-lg:    0 8px 32px rgba(0,0,0,0.6);
```

### Motion Tokens
```
--duration-fast:    150ms
--duration-base:    250ms
--duration-slow:    400ms
--ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1)   /* spring feel */
--ease-smooth:      cubic-bezier(0.4, 0, 0.2, 1)         /* standard */
```

### Component Rules
- **Cards:** `background: var(--glass-bg)`, `border: 1px solid var(--glass-border)`, `backdrop-filter: var(--glass-blur)`, `border-radius: 16px`
- **Buttons (primary):** Gold background, black text, `border-radius: 10px`, hover lifts with `transform: translateY(-1px)` + gold glow shadow
- **Buttons (ghost):** Transparent, gold border, gold text, hover fills with `--color-gold-muted`
- **Inputs:** Dark surface, gold border on focus, no default browser outline
- **Icons:** Lucide React only. Stroke width: 1.5. Size: 20px default, 16px inline
- **Loading states:** Skeleton shimmer using CSS animation (not spinners for content areas)

---

## 🗂️ Phase Structure

| Phase | Name | Deliverable |
|-------|------|-------------|
| 1 | Foundation | Design system, layout, fonts, global components |
| 2 | Auth Pages | Login, signup, Google auth, protected routes |
| 3 | Homepage | Hero with 3D model, featured products, categories |
| 4 | Product Catalogue | Products listing page with filters |
| 5 | Product Detail | 3D viewer, variant selector, add to cart |
| 6 | Cart | Cart page, item management, summary |
| 7 | Checkout | Address form, bank details, proof upload |
| 8 | Orders | Order history, order detail, mark received |
| 9 | Receipts | View receipt, download PDF, share link |
| 10 | Notifications | Bell icon, notification list, realtime updates |
| 11 | Profile | Edit profile, change password |
| 12 | Admin Dashboard | All admin pages |
| 13 | Static Pages | About, Contact |
| 14 | Hardening | Accessibility, performance, error boundaries |

---

## ⚙️ Phase 1 — Foundation

### Goal
Set up the project structure, design system, shared layouts, and global components. No real pages yet — just the scaffolding everything else hangs on.

### Project Structure
```
/app
  /layout.tsx                   Root layout (fonts, metadata, providers)
  /(public)/layout.tsx          Public layout (navbar + footer)
  /(student)/layout.tsx         Student layout (auth guard)
  /(admin)/layout.tsx           Admin layout (admin auth guard)

/components
  /ui                           Atomic components (Button, Input, Badge, etc.)
  /layout                       Navbar, Footer, Sidebar
  /3d                           Three.js viewer components
  /forms                        Reusable form components

/lib
  /supabase                     Supabase client (browser + server)
  /api                          API fetch utilities
  /utils                        Formatters, validators, helpers
  /hooks                        Custom React hooks

/store
  /cart.ts                      Zustand cart store
  /notifications.ts             Zustand notifications store

/styles
  /globals.css                  CSS variables + Tailwind base
```

### Supabase Client Setup
Two clients are needed:
- **Browser client** — for client components (auth, realtime, user-specific reads)
- **Server client** — for server components (SSR data fetching)

Use the `@supabase/ssr` package. Follow official Next.js App Router integration pattern.

### API Utility
Create one central `apiFetch(path, options)` utility that:
- Prefixes all paths with `/api`
- Attaches auth headers automatically
- Parses the standard response envelope
- Throws a typed `ApiError` on `success: false`
- Accepts an `AbortSignal` for cancellable requests

### Global Components

**Navbar:**
- Logo (left) — TACSFON Merch text mark + gold dot
- Nav links (center): Home, Products, About, Contact
- Right: Cart icon (with item count badge), notification bell, avatar/login button
- Mobile: hamburger menu, slide-in drawer
- Transparent on homepage hero, solid dark on scroll (intersection observer)

**Footer:**
- Logo + tagline
- Quick links
- WhatsApp contact
- Copyright

**Toast/Notification System:**
- Use `sonner` or build custom toasts
- Positions: bottom-right
- Types: success (green), error (red), info (gold)
- Auto-dismiss: 4 seconds

### ✅ Phase 1 Test Checklist
- [ ] App runs at localhost:3000 without errors
- [ ] Fonts load correctly (Urbanist + Inter)
- [ ] CSS variables applied globally
- [ ] Navbar renders on all public pages
- [ ] Navbar is transparent on hero, solid on scroll
- [ ] Mobile menu opens and closes
- [ ] Footer renders correctly
- [ ] `apiFetch` returns parsed data on success, throws `ApiError` on failure
- [ ] Dark background fills viewport with no white flash on load

---

## ⚙️ Phase 2 — Auth Pages

### Goal
Users can sign in via Google or email/password. Protected routes redirect unauthenticated users.

### Pages

**`/login`**
- Email + password fields
- "Continue with Google" button (gold bordered, Google icon)
- Link to `/signup`
- Error state: show inline message below form (not toast) for auth errors
- On success: redirect to `/` (or the page they were trying to access)

**`/signup`**
- Full name, email, password, confirm password, phone (optional)
- "Continue with Google" button
- Password strength indicator (visual bar)
- On success: redirect to `/` with success toast

**Auth Guards:**
- `/(student)/layout.tsx` → if no session, redirect to `/login?next={current_path}`
- `/(admin)/layout.tsx` → if no session, redirect to `/login`; if session but not admin, redirect to `/`
- After login, check `?next` param and redirect there

### Form Validation (Client-Side)
Validate before submitting to API:
```
Email:            valid format
Password:         min 8 characters, at least 1 number
Confirm password: must match password
Full name:        min 2 characters, max 100
Phone:            optional, Nigerian format if provided
```

Show inline field errors on blur, not on change (less aggressive).

### ✅ Phase 2 Test Checklist
- [ ] Sign up with email/password → account created, redirected to home
- [ ] Sign up with Google → account created via OAuth flow
- [ ] Login with wrong password → inline error shown (not toast)
- [ ] Unauthenticated user visits /orders → redirected to /login?next=/orders
- [ ] After login, redirected back to /orders
- [ ] Non-admin visits /admin → redirected to home
- [ ] Form shows inline validation errors on blur
- [ ] Password strength indicator updates in real time
- [ ] Loading spinner shown on form submit button during request

---

## ⚙️ Phase 3 — Homepage

### Goal
The flagship page. Hero section with 3D rotating merch, featured products, and category navigation.

### Sections (top to bottom)

**1. Hero Section (The Wow Effect)**
- Full viewport height (`100vh`)
- Left: Large heading ("Wear the Mission"), subheading, two CTA buttons (Shop Now → /products, Learn More → /about)
- Right: 3D rotating T-shirt model (Three.js) — user can drag to spin
- Background: very dark, subtle radial gradient from deep purple-black to midnight black
- Gold particle dust floating in background (CSS or Three.js — keep performant)
- On mobile: 3D model stacks below the text, smaller

**3D Hero Implementation:**
```
Library:     Three.js r128
Model:       Load a placeholder .glb T-shirt model (sourced from Sketchfab CC0 license)
Controls:    OrbitControls (drag to rotate, no pan, no zoom on hero)
Lighting:    Ambient light (soft warm white) + directional gold-tinted spotlight
Background:  Transparent canvas over hero gradient
Animation:   Auto-rotate at slow speed until user interacts, then stop auto-rotate
Performance: Lazy-load Three.js — don't block page render
Fallback:    If WebGL unavailable, show high-quality product image
```

**2. Category Strip**
- Horizontal scrollable row of category chips
- Each chip: category name, subtle gold border, hover fills gold
- Clicking a chip goes to `/products?category={id}`

**3. Featured Products Grid**
- Heading: "New Arrivals"
- 4 product cards (fetched server-side)
- Each card: product image, name, price, "View" button
- Card hover: slight lift + gold shadow glow
- "View All" link → `/products`

**4. Brand Statement Section**
- Full-width dark section
- Large bold text: "Premium Merch. Fellowship Spirit."
- Subtext about TACSFON
- Subtle background texture or gradient

### Data Fetching
- Hero and featured products: server component (SSR)
- 3D model: client component (requires browser WebGL)
- Categories: server component

### ✅ Phase 3 Test Checklist
- [ ] 3D model loads and auto-rotates
- [ ] User can drag to spin 3D model
- [ ] WebGL fallback shows image when WebGL unavailable
- [ ] Hero text and CTA visible above fold on desktop and mobile
- [ ] Category strip scrolls horizontally on mobile
- [ ] Featured products grid renders with correct data
- [ ] Product card hover effect works smoothly
- [ ] Page loads fast: 3D model does not block LCP (lazy loaded)
- [ ] No layout shift during 3D model load (skeleton or placeholder shown)

---

## ⚙️ Phase 4 — Product Catalogue

### Goal
Users browse and filter all available merch.

### Page: `/products`

**Layout:**
- Filter sidebar (desktop) / filter bottom sheet (mobile)
- Product grid (right, main content)

**Filters:**
- Category (checkbox list)
- Size (multi-select chips: S, M, L, XL, One Size)
- Stock type (All, In Stock, Pre-order)
- Sort: Newest, Price Low-High, Price High-Low

**Product Card:**
- Square image container (aspect-ratio: 1)
- Product name (2 lines max, ellipsis)
- Price: base price + "from" if variants have different prices
- Stock badge: "In Stock" (green), "Pre-order" (gold), "Low Stock" (if qty ≤ 3, red)
- Hover: image slight zoom, "Quick View" button fades in over image

**Pagination:**
- Infinite scroll OR numbered pagination (choose one — infinite scroll preferred for merch)
- Show skeleton cards while loading next page

**URL State:**
- Filters reflected in URL params (`?category=tops&size=L`)
- Back button preserves filter state
- Share a filtered URL and it loads with those filters active

### ✅ Phase 4 Test Checklist
- [ ] All available products shown by default
- [ ] Category filter narrows results correctly
- [ ] Size filter works
- [ ] Sort order changes product order
- [ ] Filter state persists in URL
- [ ] Back button restores filter state
- [ ] Skeleton cards show while loading
- [ ] "Low Stock" badge appears for qty ≤ 3
- [ ] Mobile filter opens as bottom sheet

---

## ⚙️ Phase 5 — Product Detail Page

### Goal
Users view a product in full detail — including the 3D model viewer — and select a variant to add to cart.

### Page: `/products/[id]`

**Layout (two columns on desktop, stacked on mobile):**

**Left — Media Panel:**
- 3D Model Viewer (primary view)
- Controls: drag to rotate, pinch/scroll to zoom, double-click to reset
- "3D" badge on viewer to indicate it's interactive
- Below viewer: thumbnail image gallery (if multiple images)
- Toggle between 3D view and flat image gallery
- Loading skeleton while model downloads

**3D Viewer Implementation:**
```
Canvas:       Full width of left column, fixed aspect ratio 1:1 on desktop
Controls:     OrbitControls with zoom enabled (unlike hero)
Model:        Load product.model_url (.glb) from Supabase Storage
              If model_url is null → show image gallery only, no 3D tab
Lighting:     Three-point lighting (key, fill, rim) — rim light gold-tinted
Loading:      Show progress bar while model loads (0–100%)
Error:        If model fails to load → fallback to image silently
Performance:  Dispose Three.js scene on component unmount (prevent memory leaks)
```

**Right — Product Info Panel:**
- Product name (large, Urbanist 700)
- Price (gold, large)
- Stock type badge
- Description (collapsed to 3 lines with "Read more" toggle)
- **Variant Selector:**
  - Size: horizontal chip group (S, M, L, XL, One Size)
  - Color: color swatch circles if applicable
  - Selected variant shown with gold border + checkmark
  - Out-of-stock variant: strikethrough, not selectable
- Stock count: "Only 3 left!" if qty ≤ 5
- Quantity selector: minus / number / plus (min 1, max stock_qty)
- **Add to Cart button:** full width, gold, large (56px tall)
- Category breadcrumb at top

**State Management:**
- Selected variant tracked in local component state
- Add to Cart → calls `POST /api/cart/items`
- On success: cart count in navbar updates (via Zustand)
- On error: show toast with error message
- Button shows loading spinner during request

### ✅ Phase 5 Test Checklist
- [ ] 3D model loads and is rotatable and zoomable
- [ ] Progress bar shows during model load
- [ ] Double-click resets camera position
- [ ] Product with no model_url shows image gallery only (no broken 3D tab)
- [ ] Selecting a size highlights it with gold border
- [ ] Out-of-stock size is visible but unselectable
- [ ] Quantity selector respects max stock_qty
- [ ] Add to Cart without selecting required variant → shows validation error
- [ ] Add to Cart succeeds → cart count in navbar increments
- [ ] Add to Cart fails → error toast shown
- [ ] Memory leak: navigate away and back, check no duplicate Three.js renderers
- [ ] Mobile: columns stack, 3D viewer is full width

---

## ⚙️ Phase 6 — Cart

### Goal
Users review their cart, adjust quantities, and proceed to checkout.

### Page: `/cart` *(auth required)*

**Layout:**
- Left (wider): Cart items list
- Right (sticky): Order summary sidebar

**Cart Item Row:**
- Product image thumbnail (square, 80px)
- Product name + variant (size / color)
- Unit price
- Quantity controls (minus / number / plus)
- Remove button (trash icon, red on hover)
- Subtotal for that item (right-aligned)

**Empty State:**
- Illustrated empty cart graphic (SVG — no external images)
- "Your cart is empty" heading
- "Start Shopping" button → `/products`

**Order Summary (sticky sidebar):**
- Item count
- Subtotal
- Delivery: "Free" (green)
- Total (large, gold)
- "Proceed to Checkout" button (full width, gold)
- "Clear Cart" text button (red, small, below main button)
  - Clicking shows a confirmation dialog before clearing

**Behavior:**
- Quantity change → debounced PATCH to `/api/cart/items/:id` (300ms debounce)
- Remove → immediate DELETE, item fades out with animation
- Clear Cart → confirmation dialog → DELETE `/api/cart` → cart empties with animation
- Cart data fetched fresh on page load (server component wrapper, client component for interactivity)
- Optimistic UI: update counts immediately, revert on API error

### ✅ Phase 6 Test Checklist
- [ ] Cart items shown with correct variant details
- [ ] Quantity increase/decrease works and calls API after debounce
- [ ] Quantity at 1 → minus button disabled (or removes item)
- [ ] Remove item → item animates out, cart updates
- [ ] Clear Cart → confirmation dialog appears
- [ ] Confirm clear → all items gone with animation
- [ ] Cancel clear → nothing happens
- [ ] Empty cart state shows illustration and CTA
- [ ] Order summary total matches sum of items
- [ ] Unauthenticated user → redirect to login

---

## ⚙️ Phase 7 — Checkout

### Goal
Student fills in delivery details, sees bank transfer instructions, and uploads proof of payment.

### Page: `/checkout` *(auth required)*

**Multi-step layout (3 steps, progress bar at top):**

**Step 1 — Delivery Details**
- Full name (pre-filled from profile)
- Phone number (pre-filled from profile)
- Delivery address (textarea — hostel name, room, street)
- "Continue" button → validates fields, moves to step 2

**Step 2 — Payment**
- Order summary (collapsed list of items + total)
- Bank transfer details box:
  ```
  Bank:           [BANK_NAME]
  Account No:     [ACCOUNT_NUMBER]
  Account Name:   [ACCOUNT_NAME]
  Amount:         ₦{order_total}
  ```
- "Copy account number" button (copies to clipboard, shows ✓ checkmark)
- Important instruction text: "Include your full name as payment narration"
- "I have made the transfer" button → creates order (`POST /api/orders`) → moves to step 3

**Step 3 — Upload Proof**
- Order created, order ID shown
- Upload area (drag-and-drop or click to browse)
  - Accepted: JPG, PNG, WebP, PDF
  - Max size: 5MB
  - Shows preview thumbnail for images
- "Submit Proof" button → calls `POST /api/orders/:id/proof`
- On success → redirect to `/orders/:id` with success toast
- "Skip for now" link (small text) → same redirect, proof can be uploaded from order detail

**State Persistence:**
- Step state lives in component (not URL) — refreshing checkout goes back to step 1
- If user already has a pending order with no proof, redirect to that order's upload page instead of creating a new order

### ✅ Phase 7 Test Checklist
- [ ] Step 1 validates all fields before allowing progression
- [ ] Step 2 shows correct bank details and order total
- [ ] Copy button copies account number to clipboard and shows feedback
- [ ] "I have made the transfer" creates order and moves to step 3
- [ ] Step 3 shows drag-and-drop upload area
- [ ] Upload area shows image preview for image files
- [ ] Uploading file > 5MB → client-side error before API call
- [ ] Uploading disallowed file type → client-side error
- [ ] Successful proof upload → redirect to order detail
- [ ] "Skip for now" → redirect to order detail without proof
- [ ] Empty cart redirect: visiting /checkout with empty cart → redirect to /cart

---

## ⚙️ Phase 8 — Orders

### Goal
Students track all their orders and their current statuses.

### Page: `/orders` *(auth required)*

**Layout:**
- Page heading: "My Orders"
- Tab bar: All | Pending | Confirmed | Dispatched | Received
- Order cards list (sorted newest first)

**Order Card:**
- Order ID (truncated: first 8 chars)
- Date placed
- Item count + first product name (e.g. "TACSFON Tee + 2 more")
- Total amount (gold)
- Status badge (color-coded):
  - Pending: amber
  - Confirmed: blue
  - Dispatched: purple
  - Received: green
- Arrow → links to `/orders/:id`

**Empty State per tab:**
- "No {status} orders" with relevant icon

### Page: `/orders/[id]` *(auth required)*

**Layout:**

**Order Header:**
- Order ID + Date
- Status badge (large)
- Timeline tracker:
  ```
  ● Placed → ○ Confirmed → ○ Dispatched → ○ Received
  ```
  Completed steps filled gold, current step pulsing, future steps dim.

**Order Items:**
- Each item: image, name, variant, quantity, unit price, subtotal

**Order Total Section:**
- Subtotal, Delivery (Free), Total

**Actions (conditional):**
- If `status = 'pending'` and no proof uploaded: "Upload Payment Proof" button → opens upload modal
- If `status = 'dispatched'`: large gold "Mark as Received" button
  - Clicking shows confirmation dialog ("Confirm you've received your order?")
  - On confirm → PATCH `/api/orders/:id/received`
- If `status = 'received'`: "View Receipt" button → `/orders/:id/receipt` or opens receipt modal

**Proof Upload Modal:**
- Same UI as Step 3 of checkout (reuse the component)
- Can be opened from order detail if proof not yet submitted

### ✅ Phase 8 Test Checklist
- [ ] All orders listed, newest first
- [ ] Tab filter works
- [ ] Each order card links to correct detail page
- [ ] Status timeline shows correct completed/pending steps
- [ ] "Upload Proof" button visible only when appropriate
- [ ] "Mark as Received" visible only for dispatched orders
- [ ] Mark as Received shows confirmation dialog
- [ ] After confirming received, status updates to 'received' and timeline updates
- [ ] "View Receipt" visible only for received (paid) orders

---

## ⚙️ Phase 9 — Receipts

### Goal
Students can view, download, and share their order receipt.

### Page: `/orders/[id]/receipt` *(auth required)*

**Layout:**
- Receipt preview panel (white/light background — contrast with dark site)
- The receipt feels like a physical document inside the dark page

**Receipt Preview Content:**
- TACSFON Merch Store header + logo
- Order ID, Date, Customer name
- Items table: Name | Variant | Qty | Unit Price | Subtotal
- Total row (bold)
- "Delivery: Free"
- Footer: "Thank you for supporting TACSFON"

**Actions bar (below preview):**
- "Download PDF" button → fetches signed URL from `GET /api/orders/:id/receipt`, triggers download
- "Copy Share Link" button → copies signed URL to clipboard
- "Back to Order" link

**Loading State:**
- Skeleton of receipt layout while fetching
- If receipt not ready yet (payment not confirmed): show message "Receipt will be available after payment is confirmed"

### ✅ Phase 9 Test Checklist
- [ ] Receipt preview renders with all correct data
- [ ] Receipt has light background contrasting with dark site
- [ ] Download PDF triggers file download
- [ ] Copy share link copies correct URL to clipboard and shows feedback
- [ ] Visiting receipt page before payment confirmed → helpful message shown (not error)
- [ ] Receipt page is print-friendly (CSS print media query)

---

## ⚙️ Phase 10 — Notifications

### Goal
Students see real-time in-app notifications when their order status changes.

### Notification Bell (Navbar Component)

**Bell Icon:**
- Lucide `Bell` icon in navbar
- Red dot badge when unread count > 0
- Badge shows count up to 9, then "9+"

**Notification Dropdown:**
- Opens on click (not hover)
- Closes on click outside
- Max height with internal scroll
- "Mark all as read" button at top

**Notification Item:**
- Unread: slightly brighter background
- Message text
- Relative time ("2 minutes ago", "Yesterday")
- Clicking marks as read + navigates to relevant order if applicable

### Realtime Setup
```javascript
// Subscribe on mount (client component)
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    // Add to Zustand store
    // Show toast
  })
  .subscribe()

// Unsubscribe on unmount — critical to prevent memory leaks
```

**On New Notification:**
1. Add to Zustand notifications store
2. Increment unread count on bell
3. Show a toast with the message
4. Bell icon does a brief pulse animation (CSS keyframe)

### ✅ Phase 10 Test Checklist
- [ ] Bell icon shows unread count badge
- [ ] Dropdown opens/closes correctly
- [ ] Realtime: admin updates order status → notification appears in < 2 seconds (no page refresh)
- [ ] Toast shows on new notification
- [ ] Bell pulse animation fires on new notification
- [ ] Clicking notification marks it read (badge count decreases)
- [ ] "Mark all as read" clears badge
- [ ] Realtime subscription unsubscribed on component unmount (verify no memory leaks)
- [ ] 0 unread → no badge shown

---

## ⚙️ Phase 11 — Profile

### Page: `/profile` *(auth required)*

**Sections:**
- Avatar circle (initials from name, gold background)
- Display: name, email, phone, joined date
- Edit form: full name, phone (email is read-only — set by auth)
- Change password section (separate form): current password, new password, confirm new password

**Behavior:**
- Edit form saves via PATCH to profile (direct Supabase update respecting RLS)
- Password change via Supabase Auth `updateUser()`
- Success toast on save
- Inline error if current password is wrong

### ✅ Phase 11 Test Checklist
- [ ] Profile displays correct user data
- [ ] Edit name and phone → saves and shows updated data
- [ ] Email field is non-editable
- [ ] Change password with wrong current password → inline error
- [ ] Change password successfully → success toast, user stays logged in

---

## ⚙️ Phase 12 — Admin Dashboard

### Goal
Admins have a full-featured dashboard to manage orders, products, and the store.

### Layout: `/(admin)/layout.tsx`
- Left sidebar (desktop): navigation links
- Top bar: admin name, "View Store" link, logout
- Mobile: collapsible sidebar

**Sidebar Links:**
```
📋 Pending Orders      /admin
✅ Confirmed           /admin/confirmed
🚚 Dispatched          /admin/dispatched
📦 Completed           /admin/completed
📜 All Orders          /admin/history
🛍️ Products            /admin/products
🏷️ Categories          /admin/categories
👥 Admins              /admin/admins
📑 Receipts            /admin/receipts
🔍 Audit Logs          /admin/logs
```

### `/admin` — Pending Orders
- Table: Order ID | Customer | Items | Total | Date | Actions
- Actions: "View Proof" button (opens image in modal), "Confirm Payment" button, "Mark Incomplete" button
- Status filter tabs at top
- Empty state: "No pending orders"

### `/admin/confirmed`, `/admin/dispatched`, `/admin/completed`
- Same table layout, filtered by status
- Dispatched page: "Mark Dispatched" action on confirmed orders

### `/admin/history`
- All orders, all statuses
- Date range filter + search by customer name / order ID

### `/admin/products`
- Product list table: Image | Name | Category | Price | Stock Type | Available | Actions
- "Add Product" button → opens slide-over panel (not new page)
- Add/Edit panel fields: name, description, base_price, category, stock_type, is_available
- Image upload in panel
- 3D model upload in panel (accepts .glb, shows file name when uploaded)
- Variants section in panel: table of size/color/stock_qty/price_override with add/edit/delete
- Delete product → confirmation dialog

### `/admin/categories`
- Simple list of categories
- Inline "Add category" input at top
- Delete button per category (disabled if products use it)

### `/admin/admins`
- Table: Name | Email | Joined | Actions
- "Add Admin" button → modal with name, email, password fields
- Delete button (disabled for own account)

### `/admin/receipts`
- Table: Order ID | Customer | Date | Amount | Actions
- "View Receipt" → opens signed URL in new tab

### `/admin/logs`
- Table: Admin | Action | Details (collapsible JSON) | Date
- Filter by admin, by action type
- Newest first

### Admin UX Rules
- All tables have loading skeletons
- All destructive actions (delete, mark incomplete) require confirmation dialog
- Success/error feedback via toast after every action
- Tables have empty states with icons

### ✅ Phase 12 Test Checklist
- [ ] Admin sidebar navigation works on all screen sizes
- [ ] Pending orders load with correct data
- [ ] "View Proof" opens proof image in modal
- [ ] "Confirm Payment" → order moves to confirmed tab
- [ ] Add product → product appears in catalogue immediately
- [ ] 3D model upload accepts .glb and rejects other types
- [ ] Variant table in product panel works (add, edit, delete)
- [ ] Add admin → new admin can log in
- [ ] Cannot delete own admin account (button disabled)
- [ ] Audit logs show all admin actions
- [ ] Non-admin user cannot access any /admin route

---

## ⚙️ Phase 13 — Static Pages

### `/about`
- TACSFON introduction
- Merch store mission
- Simple two-column layout: text + image/illustration
- CTA: "Shop the Collection" → `/products`

### `/contact`
- WhatsApp button (large, prominent): opens `https://wa.me/{number}`
- Admin email (if applicable)
- Brief note on response times

### ✅ Phase 13 Test Checklist
- [ ] Both pages render without errors
- [ ] WhatsApp button opens correct number in WhatsApp
- [ ] Pages are mobile-responsive

---

## ⚙️ Phase 14 — Hardening

### Accessibility
- All interactive elements keyboard-navigable
- Focus rings visible (gold outline, 2px)
- All images have `alt` text
- ARIA labels on icon-only buttons
- Color is never the only indicator (badges have text too)
- Test with screen reader (VoiceOver or NVDA)

### Error Boundaries
- Wrap 3D viewers in error boundaries → fallback to image on crash
- Wrap each page section independently → one section crash doesn't break whole page
- Global error boundary in root layout → fallback page for total failures

### Loading States — Rules
- Every data fetch shows skeleton (not spinner) for content areas
- Every button shows loading state during async operations (disable + spinner)
- Never show blank white space while loading

### Performance Targets
```
LCP (Largest Contentful Paint):   < 2.5s
FID (First Input Delay):           < 100ms
CLS (Cumulative Layout Shift):     < 0.1
Three.js bundle:                   Lazy loaded (not in initial bundle)
Images:                            All converted to WebP, served via next/image
3D Models:                         Loaded only when viewport is near the viewer
```

### 404 and Error Pages
- Custom `/not-found.tsx`: dark themed, "Page not found", back to home button
- Custom `/error.tsx`: dark themed, "Something went wrong", retry button

### SEO
- `metadata` exported from every page (title, description)
- `og:image` for homepage and product pages
- Canonical URLs configured
- `robots.txt`: block `/admin/*`, allow everything else
- `sitemap.xml`: auto-generated from products and static pages

### ✅ Phase 14 Test Checklist
- [ ] Tab through entire site without mouse — all interactive elements reachable
- [ ] 3D viewer crash → error boundary shows image fallback
- [ ] API failure on products page → error message, not blank page
- [ ] Lighthouse performance score ≥ 85 on mobile
- [ ] No CLS on 3D model load (placeholder reserves space)
- [ ] Custom 404 page renders
- [ ] All images use next/image with correct alt text
- [ ] /admin pages excluded from sitemap
- [ ] Open Graph tags present on homepage

---

## 🔌 Integration Contract — What You Depend On

### From Backend Engineer
- Base URL for all API calls (Vercel domain)
- Complete list of API error codes (for mapping to user-friendly messages)
- Auth cookie/header name
- File upload size limits per endpoint
- Bank account details endpoint: `GET /api/config/bank` (ask backend to add this)

### From Database Engineer
- Supabase project URL (`NEXT_PUBLIC_SUPABASE_URL`)
- Supabase anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Realtime channel name and filter syntax for notifications
- Storage bucket name for public product assets
- URL pattern for product images and 3D models

### Env Variables You Need
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=      e.g. 2348012345678
```

---

## 🚨 Error Handling Rules

1. **Never show raw API errors to users.** Map all `error.code` values to human-readable messages.
2. **Every async operation has a loading state.** No button should be clickable twice.
3. **Network failures show retry options**, not dead ends.
4. **3D viewer errors are silent** — fallback to image without alerting the user.
5. **Auth errors redirect to login** — never show a "403 Forbidden" message to students.
6. **Form errors are inline** (below the field), not in toasts.
7. **Action errors (cart, order, upload) are toasts** — short, dismissible.

### User-Friendly Error Message Map
```
CART_EMPTY              → "Your cart is empty. Add some items first!"
INSUFFICIENT_STOCK      → "Sorry, not enough stock for your requested quantity."
PRODUCT_UNAVAILABLE     → "This product is no longer available."
UNAUTHORIZED            → Redirect to /login silently
FORBIDDEN               → Redirect to / silently
NOT_FOUND               → Redirect to custom 404 page
FILE_TOO_LARGE          → "File is too large. Please upload a file under 5MB."
INVALID_FILE_TYPE       → "Invalid file type. Please upload a JPG, PNG, or PDF."
INVALID_STATUS_CHANGE   → "This action is not allowed at the current order stage."
NETWORK_ERROR           → "Connection issue. Please check your internet and try again."
UNKNOWN_ERROR           → "Something went wrong. Please try again or contact support."
```

---

## 📋 Deliverables Checklist

- [ ] All 14 phases built and individually tested
- [ ] Design system documented in a `/docs/design-system.md` file
- [ ] All pages mobile-responsive (test on 375px, 768px, 1280px)
- [ ] 3D viewer tested on Chrome, Firefox, Safari, and mobile browsers
- [ ] Lighthouse score ≥ 85 on all main pages
- [ ] All environment variables documented in `.env.example`
- [ ] No `console.log` statements in production build
- [ ] Three.js scenes properly disposed on unmount (no memory leaks)
- [ ] Error boundaries in place on all 3D components
- [ ] Deployed to Vercel with correct env vars
- [ ] Integration tested end-to-end against real backend and database

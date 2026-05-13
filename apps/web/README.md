# Qreative Spaces — Frontend

> **Inclusive Spaces · Safer Experiences · Creative Connections.**
>
> A SaaS-quality React + TypeScript frontend for discovering, booking, and listing
> inclusive creative venues across Kenya. Built from scratch with a senior-engineer
> architecture: code-split routes, typed API layer, Zustand + TanStack Query state,
> Tailwind theme, and a fully-themed component system.

---

## ✨ Features

- **Public site** — Home, Venues directory (URL-synced filters), Venue detail with
  booking flow (M-Pesa STK push + card), Events list & detail with RSVP, Become-an-Ally
  multi-step application, About, Contact, Privacy, Terms, 404.
- **Authentication** — Sign in / Sign up with React Hook Form + Zod, persisted Zustand
  session, protected dashboard routes.
- **Dashboard** — Overview with KPI cards, Spaces table, Applications, Bookings,
  Pages CMS list, Media Library, Settings.
- **Theme** — Light/Dark/System with persisted preference, smooth transitions,
  HSL CSS variables.
- **Animations** — Framer Motion entrance/scroll/transition animations on hero, cards,
  page transitions and gallery.
- **Loading / Empty / Error states** — Skeleton loaders, retry-on-error UI,
  empty-state placeholders across every async surface.
- **Responsive** — Mobile-first layouts with `sm/md/lg/xl` breakpoints, mobile drawer
  navigation, hamburger menus, sticky booking sidebars.
- **Accessibility** — Semantic HTML, focus rings, `aria-label`s on icon buttons,
  proper heading hierarchy, label-bound form controls.
- **Performance** — Route-level lazy loading, manual vendor chunks (`react-vendor`,
  `ui-vendor`, `form-vendor`, `query-vendor`), `loading="lazy"` images,
  `tailwind-merge` for fast class merging, Vite HMR.

## 🛠 Tech Stack

| Layer            | Choice                                                         |
| ---------------- | -------------------------------------------------------------- |
| Framework        | **React 18** + **TypeScript 5.6**                              |
| Build / Dev      | **Vite 5**                                                     |
| Styling          | **Tailwind CSS 3** (HSL CSS-vars, dark mode via `class`)       |
| Routing          | **React Router 6** (data router + `lazy()`)                    |
| Server state     | **TanStack Query 5**                                           |
| Client state     | **Zustand** (auth, theme, filters — `persist` middleware)      |
| HTTP             | **Axios** with interceptors (auth header, 401 handler)         |
| Forms            | **React Hook Form** + **Zod** (`@hookform/resolvers`)          |
| Animations       | **Framer Motion**                                              |
| Icons            | **lucide-react**                                               |
| Toasts           | **sonner**                                                     |
| Class utilities  | `clsx`, `tailwind-merge` (`cn()` helper)                       |

## 📁 Project Structure

```
src/
├── app/                      # App composition root
│   ├── App.tsx               # Top-level providers + router
│   ├── ErrorBoundary.tsx     # Route-level error UI
│   └── providers/
│       ├── QueryProvider.tsx
│       └── ThemeProvider.tsx
├── components/
│   ├── ui/                   # Design system: Button, Input, Card, Badge, etc.
│   └── common/               # Navbar, Footer, ThemeToggle, ScrollToTop, PageTransition
├── features/                 # Feature-scoped composites
│   ├── home/                 # HeroSection, FeaturedVenues, HowItWorks, Values, CTA
│   ├── venues/               # VenueCard, VenueGallery, FilterBar
│   ├── events/               # EventCard
│   ├── bookings/             # BookingForm
│   └── dashboard/            # StatCard
├── pages/                    # One file per route, lazy-loaded
│   ├── HomePage.tsx
│   ├── VenuesPage.tsx
│   ├── VenueDetailPage.tsx
│   ├── EventsPage.tsx
│   ├── EventDetailPage.tsx
│   ├── AboutPage.tsx
│   ├── ContactPage.tsx
│   ├── BecomeAnAllyPage.tsx
│   ├── PrivacyPage.tsx · TermsPage.tsx · NotFoundPage.tsx
│   ├── auth/{SignInPage,SignUpPage}.tsx
│   └── dashboard/{Overview,Spaces,Bookings,Applications,Pages,Media,Settings}Page.tsx
├── layouts/                  # PublicLayout · AuthLayout · DashboardLayout
├── routes/                   # Router config + ProtectedRoute
├── services/                 # API abstraction
│   ├── http.ts               # Axios instance + interceptors
│   ├── {venues,events,bookings,applications,auth,dashboard}.service.ts
│   └── mock/                 # In-memory fixtures + delay() helper
├── hooks/                    # Reusable hooks (useVenues, useEvents, useDebounce, ...)
├── store/                    # Zustand stores (auth, theme, filters)
├── types/                    # Shared TS types
├── constants/                # App-wide constants
├── utils/                    # cn(), formatters, env reader
├── styles/globals.css        # Tailwind + tokens
├── main.tsx · vite-env.d.ts
└── ...
public/
├── favicon.svg
└── images/{hero-bg,venue-1,venue-2,venue-3}.jpg
```

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env (defaults work out of the box with mock API)
cp .env.example .env

# 3. Start the dev server (http://localhost:5173)
npm run dev

# 4. Type-check + production build
npm run build

# 5. Preview the production build
npm run preview
```

### Environment variables

| Variable               | Default                          | Notes                                                              |
| ---------------------- | -------------------------------- | ------------------------------------------------------------------ |
| `VITE_API_BASE_URL`    | `http://localhost:4000/api`      | Used when `VITE_USE_MOCK_API=false`.                              |
| `VITE_APP_NAME`        | `Qreative Spaces`                | Visible app name.                                                  |
| `VITE_USE_MOCK_API`    | `true`                           | When `true`, services return in-memory fixtures with a small delay. |

> **Mock-first.** The app ships with realistic fixtures so you can run, demo, and
> develop without a backend. Flip `VITE_USE_MOCK_API=false` to wire it to your real
> API — every service has the matching endpoint scaffolded.

## 🧭 Routes

| Path                         | Layout       | Notes                                |
| ---------------------------- | ------------ | ------------------------------------ |
| `/`                          | Public       | Marketing home                       |
| `/venues`                    | Public       | URL-synced filterable directory      |
| `/venues/:slug`              | Public       | Venue detail + booking sidebar       |
| `/events`                    | Public       | Events list with category filter     |
| `/events/:slug`              | Public       | Event detail + RSVP                  |
| `/become-an-ally`            | Public       | Multi-section ally application       |
| `/about` · `/contact`        | Public       | About & contact form                 |
| `/privacy` · `/terms`        | Public       | Legal                                |
| `/sign-in` · `/sign-up`      | Auth         | Split-screen auth                    |
| `/dashboard/...`             | **Protected** | Owner / admin area                  |
| `*`                          | —            | 404                                  |

## 🎨 Design tokens

- **Primary (Coral):** `#E94E2C` — `hsl(11 80% 55%)`
- **Accent (Purple):** `#8B5CF6` — `hsl(263 70% 66%)`
- **Surface (Cream):** `#FDF6F0`
- **Dark surface:** `#0a0a0a` / `#0f0f0f`
- **Type:** Inter (UI) + Fraunces (display)
- **Radius:** `--radius: 0.75rem`

All tokens live in [src/styles/globals.css](src/styles/globals.css) and are exposed
via Tailwind's `theme.extend.colors` mapping in
[tailwind.config.js](tailwind.config.js).

## 🧪 Code quality

- `tsc --noEmit` runs as part of `npm run build`
- Strict TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`)
- No prop drilling — global concerns flow through Zustand + TanStack Query
- Components are small, composable, and named after their role
- All async surfaces have **loading**, **empty**, and **error** states

## 📦 Build output

The production build is code-split into vendor chunks plus one chunk per lazy route:

```
react-vendor  ~207 kB  ·  ui-vendor (motion + icons)  ~136 kB
form-vendor   ~79 kB   ·  query-vendor (axios + RQ)    ~81 kB
+ ~20 route chunks (1–9 kB each)
```

## 🪄 Mock data

In-memory fixtures live in
[src/services/mock/fixtures.ts](src/services/mock/fixtures.ts) — six venues, four
events, two ally applications, dashboard stats. Replace with your real API by
flipping `VITE_USE_MOCK_API` to `false`; each service has the matching `http.get/post`
fallback already wired.

## 📝 License

Internal proprietary code. © Qreative Spaces, Nairobi.

# Frontend — SigmaLoop Client

> See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the full color theme reference (light + dark), brand colors, component tokens, and logo description.

## Stack

- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS v4.1.17 with @tailwindcss/typography
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **HTTP Client**: Axios v1.13.2
- **Routing**: React Router DOM v7.10.1
- **Icons**: Lucide React
- **Testing**: Vitest + @testing-library/react
- **Containerization**: Docker (nginx for production serving)

## Entry Points

- `index.html` — HTML shell with `<div id="root">`
- `src/main.tsx` — React root, renders `<App />`
- `src/App.tsx` — AuthProvider + React Router routes

## Project Structure

```
src/
├── components/
│   ├── common/              # Shared components
│   │   ├── Navbar.tsx       # Top nav bar with auth-aware links
│   │   ├── Footer.tsx       # Site footer
│   │   ├── PageMeta.tsx     # <head> management via react-helmet-async
│   │   ├── ErrorBoundary.tsx  # Catches unhandled errors in child components
│   │   ├── LoadingSkeleton.tsx  # Skeleton loaders (Skeleton, CardSkeleton, DashboardSkeleton, etc.)
│   │   ├── EmptyState.tsx   # Reusable empty state (icon, title, description, action)
│   │   └── NotFound.tsx     # 404 page component
│   ├── ui/                  # Design system: Button, Card, Badge, Input
│   └── layouts/             # Page wrappers: MainLayout, AuthLayout, LessonLayout, AdminLayout
├── constants/
│   ├── index.ts             # App-wide constants (API_BASE_URL, ROLES, LANGUAGES, STATUSES)
│   └── routes.ts            # Route path constants + buildRoute() helper
├── contexts/
│   └── AuthContext.tsx       # Global auth state (Context API)
├── hooks/
│   ├── useDebounce.ts       # Debounce a value (for search inputs)
│   ├── useLocalStorage.ts   # Sync state with localStorage
│   └── useClickOutside.ts   # Detect clicks outside an element (dropdowns, modals)
├── utils/
│   ├── cn.ts                # CSS class name merging utility
│   └── formatters.ts        # Date, number, string formatting helpers
├── pages/
│   ├── Home/Home.tsx
│   ├── Auth/Login.tsx, Register.tsx
│   ├── Dashboard/Dashboard.tsx
│   ├── Course/CourseList.tsx, CourseDetails.tsx
│   ├── Lesson/
│   │   ├── LessonView.tsx           # Main lesson page
│   │   └── components/             # CodeEditor, CodeWorkspace, OutputPanel, LessonContent
│   ├── Curriculum/Curriculum.tsx
│   ├── Mentor/Mentor.tsx
│   └── Admin/                       # Admin panel (Courses, Lessons, Challenges, Users, Dashboard)
├── services/
│   ├── api.ts               # Axios instance + interceptors
│   ├── userService.ts       # User-related API calls
│   ├── lessonService.ts     # Lesson + code execution API calls
│   └── adminService.ts      # Admin CRUD API calls
├── types/api.ts             # TypeScript interfaces for API responses
├── assets/                  # Static assets (Logo.png, react.svg)
├── test/setup.ts            # Vitest setup
└── index.css                # Tailwind imports + custom utilities
```

## Routing

Use constants from `src/constants/routes.ts` instead of hardcoded strings:

```typescript
import { ROUTES, buildRoute } from '../constants/routes';

// Static route
<Link to={ROUTES.DASHBOARD}>Dashboard</Link>

// Dynamic route
<Link to={buildRoute(ROUTES.COURSE_DETAILS, { courseId: '123' })}>View Course</Link>
```

| Path | Component | Auth | Layout |
|------|-----------|------|--------|
| `/` | Home | Public | MainLayout |
| `/login` | Login | Public only | AuthLayout |
| `/register` | Register | Public only | AuthLayout |
| `/dashboard` | Dashboard | Protected | MainLayout |
| `/courses` | CourseList | Protected | MainLayout |
| `/courses/:courseId` | CourseDetails | Protected | MainLayout |
| `/lessons/:lessonId` | LessonView | Public* | LessonLayout |
| `/curriculum` | Curriculum | Protected | MainLayout |
| `/mentor` | Mentor | Protected | MainLayout |
| `/admin/*` | Admin pages | Protected | AdminLayout |

*Lesson route is temporarily public for testing.

## Patterns & Conventions

### Adding a New Page
1. Create page component in `src/pages/NewPage/NewPage.tsx`
2. Add route constant in `src/constants/routes.ts`
3. Add route in `src/App.tsx` with appropriate layout and auth wrapper
4. Add navigation link in `src/components/common/Navbar.tsx` if needed

### Adding API Calls
1. Add TypeScript types in `src/types/api.ts`
2. Create or extend a service file in `src/services/`
3. Use the shared Axios instance from `src/services/api.ts`
4. Use constants from `src/constants/index.ts` for roles, languages, statuses

### Auth Context Usage
```typescript
import { useAuth } from '../contexts/AuthContext';
const { user, isAuthenticated, login, logout } = useAuth();
```

### Available Hooks
```typescript
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useClickOutside } from '../hooks/useClickOutside';
```

### Available Utilities
```typescript
import { cn } from '../utils/cn';
import { formatDate, formatRelativeTime, formatNumber, formatProgress, truncate, capitalize } from '../utils/formatters';
```

### Error Handling
Wrap pages or sections with `<ErrorBoundary>`:
```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary';
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### Loading States
Use skeleton components for better perceived performance:
```tsx
import { CardListSkeleton, DashboardSkeleton, Skeleton } from '../components/common/LoadingSkeleton';
if (loading) return <CardListSkeleton count={6} />;
```

### Empty States
```tsx
import { EmptyState } from '../components/common/EmptyState';
<EmptyState title="No courses yet" description="Enroll to get started." action={<Button>Browse</Button>} />
```

### Component Conventions
- UI primitives live in `src/components/ui/` — reusable, no business logic
- Common components in `src/components/common/` — shared across pages
- Page-specific sub-components live alongside their page (e.g., `pages/Lesson/components/`)
- Layouts provide page structure (Navbar/Footer, sidebars, etc.)

### Styling
- Tailwind utility classes for all styling
- Use `cn()` from `src/utils/cn.ts` for conditional classes
- Custom CSS utilities in `index.css`: `.glass-panel`, `.glass-card`, `.text-gradient`
- Fonts: Inter (body), Outfit (display/headings)
- Color palette: Indigo-based primary, gray neutrals
- Responsive: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

### Button Component
5 variants available: `primary`, `secondary`, `ghost`, `danger`, `outline`
```tsx
<Button variant="primary" size="md" onClick={handler}>Label</Button>
```

## API Configuration

Set via environment variable (see `.env.example`):
```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

The `API_BASE_URL` constant in `src/constants/index.ts` reads from `import.meta.env.VITE_API_BASE_URL` with a fallback to `http://localhost:4000/api/v1`.

Axios interceptors handle:
- **Request**: Auto-attaches `Authorization: Bearer <token>` from localStorage
- **Response**: Dispatches `auth:unauthorized` custom event on 401, normalizes JSend errors

## Docker

```bash
docker build -t lambda-lap-frontend .  # Build image
# Serves via nginx on port 80 with SPA fallback
```

Nginx config in `nginx.conf` handles SPA routing and static asset caching.

## Testing

```bash
npm run test           # Run Vitest
npm run test:coverage  # With coverage
```

Test environment: jsdom. Setup file imports `@testing-library/jest-dom`.

## Known Gaps

- Admin panel has no role-based route guard yet (uses generic ProtectedRoute)
- Mentor page uses mock data — AI integration pending
- Curriculum page has hardcoded data — needs API integration
- No toast/notification system (errors use console.error or basic UI)
- No dark mode toggle (Navbar has a `darkMode` prop but it's not wired)

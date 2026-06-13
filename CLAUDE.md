# Frontend — SigmaLoop Client

> SigmaLoop is a **personalized AI tutor** for programming and mathematics. The mentor chat is the primary entry point; every Course / Lesson / Challenge the user sees was AI-generated for them. See the root `CLAUDE.md` for the full vision. See `DESIGN_SYSTEM.md` for color theme, brand colors, component tokens, and logo description.

## Stack

- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS v4.1.17 with @tailwindcss/typography
- **Code Editor**: Monaco Editor (`@monaco-editor/react`) — used for PROGRAMMING challenges
- **LaTeX**: KaTeX (via `rehype-katex`, `remark-math`) — used for MATH challenges (rendering + a preview pane for the student's LaTeX input)
- **Markdown**: `react-markdown` + `rehype-highlight` for syntax-highlighted code blocks
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
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PageMeta.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── NotFound.tsx
│   ├── ui/                  # Button, Card, Badge, Input
│   ├── chat/                # Mentor chat widget + message list + curriculum-request CTA
│   ├── challenge/           # ProgrammingChallenge.tsx, MathChallenge.tsx — kind-branched renderers
│   └── layouts/             # MainLayout, AuthLayout, LessonLayout, AdminLayout
├── constants/
│   ├── index.ts             # App-wide constants (API_BASE_URL, ROLES, LANGUAGES, CHALLENGE_KINDS, STATUSES)
│   └── routes.ts            # Route path constants + buildRoute() helper
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useClickOutside.ts
│   └── useCurriculumJob.ts  # Polls /curriculum/jobs/:id until READY
├── utils/
│   ├── cn.ts
│   └── formatters.ts
├── pages/
│   ├── Home/Home.tsx              # Landing — pitches the AI tutor, CTA to /mentor
│   ├── Auth/Login.tsx, Register.tsx
│   ├── Mentor/Mentor.tsx          # Primary entry point — chat + curriculum requests
│   ├── MyCourses/MyCourses.tsx    # The current user's personalized courses
│   ├── Course/CourseDetails.tsx   # Read-only view of a generated course
│   ├── Lesson/
│   │   ├── LessonView.tsx                # Branches on challenge.kind
│   │   └── components/
│   │       ├── ProgrammingWorkspace.tsx  # Monaco + OutputPanel
│   │       ├── MathWorkspace.tsx         # LaTeX textarea + KaTeX preview + verdict panel
│   │       └── LessonContent.tsx
│   └── Admin/                     # Admin panel (Users, Curriculum Jobs, System)
├── services/
│   ├── api.ts                # Axios instance + interceptors
│   ├── authService.ts
│   ├── chatService.ts        # Mentor chat — send/receive messages
│   ├── curriculumService.ts  # Request generation, poll job status
│   ├── courseService.ts      # List/get the user's courses (read-only)
│   ├── lessonService.ts      # Read lessons, run + submit programming code
│   ├── mathService.ts        # Submit LaTeX answers
│   └── adminService.ts
├── types/api.ts              # TypeScript interfaces for API responses
├── assets/
├── test/setup.ts
└── index.css                 # Tailwind imports + custom utilities
```

## Routing

Use constants from `src/constants/routes.ts` instead of hardcoded strings:

```typescript
import { ROUTES, buildRoute } from '../constants/routes';

<Link to={ROUTES.MENTOR}>Talk to your tutor</Link>
<Link to={buildRoute(ROUTES.COURSE_DETAILS, { courseId: '123' })}>Open course</Link>
```

| Path | Component | Auth | Layout | Notes |
|------|-----------|------|--------|-------|
| `/` | Home | Public | MainLayout | Landing; CTA → `/mentor` |
| `/login` | Login | Public only | AuthLayout | |
| `/register` | Register | Public only | AuthLayout | |
| `/mentor` | Mentor | Protected | MainLayout | **Primary entry point** — chat + curriculum requests |
| `/my-courses` | MyCourses | Protected | MainLayout | Lists the current user's personalized courses |
| `/courses/:courseId` | CourseDetails | Protected | MainLayout | Read-only; ownership-checked server-side |
| `/lessons/:lessonId` | LessonView | Protected | LessonLayout | Branches on `challenge.kind` |
| `/admin/*` | Admin pages | Protected (ADMIN) | AdminLayout | Users, jobs, system |

There is **no** `/courses` public catalog and **no** instructor-authoring pages. All content is per-user generated.

## Patterns & Conventions

### Branching on Challenge Kind
Every place that renders or submits a challenge must branch on `kind`:

```tsx
import { CHALLENGE_KINDS } from '../constants';

if (challenge.kind === CHALLENGE_KINDS.PROGRAMMING) {
  return <ProgrammingWorkspace challenge={challenge} />;
}
if (challenge.kind === CHALLENGE_KINDS.MATH) {
  return <MathWorkspace challenge={challenge} />;
}
```

### Mentor Chat → Curriculum Generation
The chat is the entry point for new courses. When the mentor decides (or the user asks) to build a curriculum:

1. The chat component calls `curriculumService.request({ threadId, goals })`.
2. The response is a `jobId` and the chat shows "Generating your curriculum…".
3. `useCurriculumJob(jobId)` polls until status is `READY` or `FAILED`.
4. On `READY`, the UI navigates to the new course.

Polling lives in a custom hook; never poll inline in a component.

### MATH Submission UX
The `MathWorkspace` shows:
- The problem statement (rendered with KaTeX).
- A LaTeX `<textarea>` for the student's answer.
- A live KaTeX preview pane below the textarea.
- On submit: a verdict panel with the LLM's `correct`/`equivalentForm`/`rationale` and a confidence indicator. Verdicts with `confidence < 0.7` are surfaced as "Pending review" rather than as a hard correct/incorrect.

### Adding a New Page
1. Create page component in `src/pages/NewPage/NewPage.tsx`.
2. Add route constant in `src/constants/routes.ts`.
3. Add route in `src/App.tsx` with appropriate layout and auth wrapper.
4. Add navigation link in `src/components/common/Navbar.tsx` if needed.

### Adding API Calls
1. Add TypeScript types in `src/types/api.ts`.
2. Create or extend a service file in `src/services/`.
3. Use the shared Axios instance from `src/services/api.ts`.
4. Use constants from `src/constants/index.ts` for roles, kinds, languages, statuses.

### Auth Context Usage
```typescript
import { useAuth } from '../contexts/AuthContext';
const { user, isAuthenticated, login, logout } = useAuth();
```

Roles are `STUDENT | ADMIN` only — there is no INSTRUCTOR role. The Admin layout's route guard checks `user.role === 'ADMIN'`.

### Available Hooks
```typescript
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useClickOutside } from '../hooks/useClickOutside';
import { useCurriculumJob } from '../hooks/useCurriculumJob';
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
Use skeleton components for better perceived performance. Curriculum generation has its own dedicated skeleton (`CurriculumGeneratingSkeleton`) that mimics the eventual course layout.

### Component Conventions
- UI primitives live in `src/components/ui/` — reusable, no business logic.
- `src/components/chat/` and `src/components/challenge/` are the two feature-specific component groups; everything else common lives in `src/components/common/`.
- Page-specific sub-components live alongside their page (e.g., `pages/Lesson/components/`).
- Layouts provide page structure (Navbar/Footer, sidebars, etc.).

### Styling
- Tailwind utility classes for all styling.
- `cn()` from `src/utils/cn.ts` for conditional classes.
- Custom CSS utilities in `index.css`: `.glass-panel`, `.glass-card`, `.text-gradient`.
- Fonts: Inter (body), Outfit (display/headings).
- Color palette: Indigo-based primary, gray neutrals.
- Responsive: Mobile-first with `sm:`, `md:`, `lg:` breakpoints.

### Button Component
5 variants available: `primary`, `secondary`, `ghost`, `danger`, `outline`.
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
- **Request**: Auto-attaches `Authorization: Bearer <token>` from localStorage.
- **Response**: Dispatches `auth:unauthorized` custom event on 401, normalizes JSend errors.

## Docker

```bash
docker build -t sigmaloop-frontend .  # Build image
# Serves via nginx on port 80 with SPA fallback
```

Nginx config in `nginx.conf` handles SPA routing and static asset caching.

## Testing

```bash
npm run test           # Run Vitest
npm run test:coverage  # With coverage
```

Test environment: jsdom. Setup file imports `@testing-library/jest-dom`.

## Migration From the Old Vision

The codebase still contains pages and components from the previous "browse-the-catalog" vision (instructor-authored CourseList, curated Curriculum page with hardcoded data, instructor CRUD pages). The new vision:

| Old | New |
|---|---|
| `pages/Course/CourseList.tsx` (public catalog) | `pages/MyCourses/MyCourses.tsx` (per-user) |
| `pages/Curriculum/Curriculum.tsx` (hardcoded) | Removed — the mentor *generates* the curriculum |
| `pages/Mentor/Mentor.tsx` (mock-data chat) | Real AI-backed chat + curriculum-request CTA |
| Admin: course/lesson/challenge CRUD | Admin: users, curriculum jobs, system |
| Generic `ProtectedRoute` | Role-aware guards (STUDENT vs ADMIN) |
| INSTRUCTOR role in `constants` | Removed — STUDENT and ADMIN only |

Code-level cleanup of these artifacts is a separate task tracked outside this doc.

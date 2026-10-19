# Frontend Implementation Guide

This document describes the frontend work currently in this repository: how the app is organized, what each part of the screen does, which interactions work, and how to continue the implementation.

For a simple presentation script, see [PROJECT_EVALUATION_GUIDE.md](PROJECT_EVALUATION_GUIDE.md).

## 1. Frontend at a glance

ContractPulse AI is a responsive, single-page React application for reviewing public infrastructure contract data. The interface is designed around this workflow:

1. Scan a portfolio summary.
2. Notice a project that may need follow-up.
3. Open the project brief.
4. Review the example risks and supporting text.
5. Approve or dismiss the suggested action.

Project, milestone, and progress data are loaded from the Spring Boot API. Risk explanations, evidence, notifications, reports, and recommendations remain illustrative sample content; approval and dismissal do not persist.

## 2. Technology used

- **React 19** renders the interface and handles browser interactions.
- **TypeScript** provides types for the project data and selected project.
- **Vite 8** runs the development server and creates the production build.
- **Recharts** draws the schedule baseline and forecast chart.
- **Lucide React** supplies interface icons.
- **Oxlint** runs the configured lint check.
- **Spring Boot REST API** serves projects, milestones, and progress backed by seeded H2 data.

## 3. Main files

| File | Purpose |
| --- | --- |
| `src/main.tsx` | Starts React and renders the root `App` component. |
| `src/App.tsx` | Contains the dashboard layout, API-backed state, and user interactions. |
| `src/api.ts` | Typed fetch client for the Spring Boot project, milestone, and progress routes. |
| `src/App.css` | Styles the dashboard, project brief drawer, chart area, and responsive layouts. |
| `src/index.css` | Sets global fonts, page colors, box sizing, and keyboard focus styles. |
| `index.html` | Provides the browser document, page title, and React mount element. |
| `package.json` | Defines dependencies and development, build, and lint commands. |

Most of the dashboard is currently in one component in `src/App.tsx`. That keeps the prototype easy to run, but before the interface grows further, repeated areas such as the project table, metric tile, signal row, and project drawer could be extracted into separate components.

## 4. Page structure

### Sidebar

The sidebar contains the ContractPulse brand, a sample workspace selector, navigation buttons, sync label, help button, and a sample user profile. It becomes a slide-in navigation panel on smaller screens.

Each navigation item opens a separate frontend view. Projects has status filters, Risk Signals has category filters, Documents has sample-document search and preview, Contractors summarizes partners in the sample projects, Budget & Spend shows sample commitments and cost risk, and Help Center gives a short demo walkthrough. These views use local data and are not backed by APIs.

### Top bar

The top bar contains the workspace breadcrumb, search, notification button, and sample user avatar. On small screens the search field can expand from its icon.

### Portfolio summary

Four metric tiles derive project counts, high schedule-risk count, committed budget, and milestone totals from API response data. Seeded risk scores are illustrative demo values, not model predictions.

- Active contracts.
- Contracts needing attention.
- Committed budget.
- Milestones this month.

Budget values use Indian rupees (INR) and are shown in crore units. These are sample values; no exchange-rate conversion is performed.

### Weekly follow-up note

A highlighted strip names a specific example: the East River permit review may affect its foundation milestone. Its button opens that project's details.

### Schedule chart

The chart averages actual and planned progress across projects for each date returned in their progress histories. Recharts provides the chart, axes, grid, tooltip, and series.

The timeframe control currently switches between the labels “6 months” and “12 months.” The data array and chart range remain the same.

### Priority signals

The Overview page shows three clickable sample project concerns. The full Risk Signals page lets the user filter by schedule or cost and open the related project brief. The percentages are demonstration risk scores, not predictions from a running model.

### Project table

The table displays project name, agency, contractor, budget, completion progress, delay risk, cost risk, and status from the API. Clicking a row opens its brief. The three-dot row button also opens the brief without relying on the row click.

The search input filters the currently loaded projects by project name, agency, or contractor. The filter button is a simple demo shortcut: it applies or clears the text `East` in that same search input.

### Project brief drawer

The drawer opens from the right side of the screen. It shows:

- Project identity and agency.
- Delay and cost risk values.
- The next milestone and date.
- Progress variance, schedule variance in days, and a milestone-delay table.
- Sample factors that explain the risk.
- An excerpt from sample field-report text.
- A suggested next step and possible impact.
- Approve, dismiss, and undo interactions.

Clicking the backdrop or close button closes the drawer. The variance calculations live in `src/projectFeatures.ts`. Progress variance is actual progress minus planned progress in percentage points. Schedule variance is forecast project finish minus baseline finish in days. Milestone delay compares its planned finish with the actual finish when complete, or its forecast finish while incomplete. Positive values indicate behind schedule; missing comparison dates produce no numeric result. These are deterministic sample features, not an AI model. The factor descriptions, evidence excerpt, and suggested action are currently static demonstration text.

Approving and dismissing update local React state. The UI changes to show the decision and an audit-style message, but the event is not sent to a server and does not survive a page reload. The decision state is currently shared across project selections rather than stored separately per project.

### Notifications

The bell opens a popover with three sample notifications. The content and unread count are static; there is no notification service or read/unread interaction. The separate Documents page provides a local sample list, type filters, text search, and a static preview. The Contractors and Budget & Spend pages summarize the same sample projects.

## 5. Data and UI state

### API-backed sample data

`backend/src/main/resources/schema.sql` creates project, milestone, and progress snapshot tables. `data.sql` seeds four projects, nine milestones, and progress history. `src/api.ts` defines the typed API client, and `src/projectFeatures.ts` contains the shared project types and feature calculations.

The **Add project**, **Record update**, **Add milestone**, milestone status, and **Delete project** interactions call Spring Boot and update React state from server responses. New projects start as **Pending risk review** without risk scores. H2 is in-memory, so data resets when the backend restarts.

### React state

The `App` component uses `useState` for:

- `activePage`: selected sidebar label and breadcrumb heading.
- `search`: text used to filter local project rows.
- `searchOpen`: expanded search state on mobile.
- `selectedProject`: project displayed in the drawer, or `null` when closed.
- `notificationsOpen`: notification popover visibility.
- `mobileNavOpen`: mobile sidebar visibility.
- `approved`: local approval status.
- `dismissed`: local dismissal status.
- `timeframe`: displayed timeframe label.

`useMemo` derives the visible projects when `search` changes. This is adequate for the small example list. With real data, search, pagination, and filters should usually be requested from the backend.
`useEffect` loads the initial project list and exposes loading and API error states.

## 6. Visual design and responsiveness

The interface uses a deep green sidebar with a light neutral main area. Green, warm red, and gold identify positive, high-risk, and watch states. The main view uses white, lightly bordered panels to make the dense information easier to scan.

Global defaults are in `src/index.css`. Page-specific layout and responsive behavior are in `src/App.css`.

Important CSS breakpoints:

- At **1150px**, the sidebar and page spacing become narrower.
- At **900px**, the sidebar becomes a hidden, slide-in mobile menu and the main view takes the full width.
- At **700px**, metric tiles become a two-column grid, the chart and signals stack, and search can expand from its icon.
- At **390px**, horizontal padding and some metric spacing reduce for narrow phones.

The project table uses a horizontally scrollable wrapper so its columns remain readable on narrow screens. The chart uses Recharts' responsive container.

## 7. Interaction reference

| Control | Current behavior |
| --- | --- |
| Sidebar item | Opens its section view and updates active styling and heading. |
| Search | Filters the loaded demo projects. Escape closes the expanded mobile search. |
| Filter button | Applies or clears the sample search term `East`. |
| Project row or signal | Opens the selected project's drawer. |
| Add project | Opens a validated form and creates a project through the API with one milestone and an initial progress snapshot. |
| Project details | Shows progress/schedule feature values, planned-vs-actual snapshot chart, and milestone planned/forecast/actual delay. |
| Record update | Adds or replaces a dated progress snapshot through the API; latest snapshot becomes current project progress. |
| Add milestone | Creates a milestone through the API. |
| Milestone status | Updates a milestone through the API; marking Complete records today's date as actual finish. |
| Delete project | Deletes the selected project through the API after confirmation. |
| Close button or drawer backdrop | Closes the drawer. |
| Approve recommendation | Shows a local approved state. |
| Dismiss recommendation | Shows a local dismissed state and disables approval; Undo restores the recommendation. |
| Bell | Opens and closes the static notification popover. |
| Timeframe button | Switches its label, but does not change chart values. |
| Mobile menu | Opens and closes the sidebar. |
| “Open project” note button | Opens the East River example. |
| Risk Signals filters | Filter the local signals to all, schedule, or cost concerns. |
| Documents search and filters | Search the local document list and filter it by document type. |
| Document preview | Select a sample record to show its static excerpt; Open project opens its associated project brief. |
| Contractor project link | Opens the associated project brief. |
| Budget project row | Opens the associated project brief. |

## 8. How to run and check it

Use Node.js 20.19 or newer, or Node.js 22.12 or newer. The backend requires Java 21+; its Maven wrapper downloads Maven 3.9.11 on first use.

Start the backend in one terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Start the frontend in another terminal:

```powershell
npm install
npm run dev
```

Vite prints the local address after startup. Run a production build and lint check with:

```sh
npm run build
npm run lint
```

## 9. Suggested next frontend improvements

1. Break the large `App` component into smaller components, keeping behavior unchanged.
2. Move demo records and future API types into separate files.
3. Add component tests for search, filters, document selection, navigation, project details, and approve/dismiss/undo states.
4. Add loading, empty, error, and stale-data states for the future API.
5. Make the timeframe control update the chart range when real time-series data is available.
6. Add clear keyboard semantics and focus management for the modal-style drawer and notification popover.
7. Store approval and dismissal state per project when a backend is available.

## 10. Spring Boot API boundary

The typed API client is `src/api.ts`; it uses `VITE_API_BASE_URL` when configured and otherwise targets `http://localhost:8080/api`. Route definitions are in `backend/src/main/java/com/contractpulse/api/ProjectController.java`. The API includes CRUD routes for projects, progress snapshots, and milestones. The current UI exposes create/read/delete for projects, create/upsert for progress, and create/update for milestones.

Project data is backed by seeded H2 in-memory tables and resets when Spring Boot restarts. Risk assessments, evidence, notifications, and recommendation decisions remain illustrative UI data and are not API resources in this evaluation demo. Do not place database credentials or private service secrets in the frontend.

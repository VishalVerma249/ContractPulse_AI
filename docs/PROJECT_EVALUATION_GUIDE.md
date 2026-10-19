# ContractPulse AI: Easy Project Guide

## What is ContractPulse AI?

ContractPulse AI is a dashboard idea for people who manage public construction projects, such as roads, bridges, flood barriers, and water systems.

These projects involve many contractors, schedules, budgets, and reports. Important details can be spread across many documents. This dashboard brings the main details together so a project manager can see what needs attention, understand the reason, check the evidence, and decide what to do next.

**Important:** This evaluation version connects the React frontend to a Spring Boot REST API backed by a seeded H2 in-memory database. The project, milestone, and progress records are demo data and reset when the backend restarts. Risk scores, explanations, report text, and recommendations are illustrative; no AI model, authentication, or saved approval workflow is connected.

## The problem it is trying to solve

Project managers need to answer questions like:

- Is the project falling behind its schedule?
- Is the project spending more than expected?
- What is causing the problem?
- Which report supports this concern?
- What should the team follow up on first?
- Who approved or dismissed the suggested action?

ContractPulse is designed to help answer these questions from one place. It is meant to support people making decisions, not make important project decisions by itself.

## Who might use it?

- A **program director** who watches many projects at once.
- A **project controls team** that tracks schedule and spending.
- An **agency reviewer** who helps resolve permits and approvals.
- A **contract manager** who follows up with construction companies.

The person shown in the demo is an example user. The website does not have real accounts or control what each person is allowed to see.

## What the dashboard shows

### Portfolio overview

At the top, the dashboard shows totals derived from the four projects returned by Spring Boot: project count, high schedule-risk count, committed budget, and milestone count. A short note explains that the risk scores are illustrative.

These totals are examples, but the counts and budget are calculated from the current API response.

### Schedule chart

The chart compares actual and planned progress from the API's dated progress snapshots. Portfolio values are averages of the available project snapshots on each date.

- **Planned progress:** how much work the plan says should be finished.
- **Actual progress:** the sample progress entered for that reporting date.

The chart is not a real forecasting system.

The “6 months / 12 months” button changes its label only. It does not change the chart data yet.

### Priority follow-ups

The dashboard lists three example issues:

1. **East River Flood Barrier:** a permit review may hold up foundation work.
2. **I-405 Sound Wall Expansion:** material costs may be higher than planned.
3. **South County Water Main:** spending is ahead of completed work.

The percentages beside these issues are example risk scores. They are not verified predictions. A real system would need real project data and careful testing before these scores could be trusted.

### Project list

The table shows project names, contractors, budgets, progress, delay risk, cost risk, and status from the Spring Boot API. You can search for a project, agency, or contractor. Selecting a row opens more information about that project.

There are four seeded sample projects in the table. Portfolio totals are calculated from these four projects.

### Project details and recommendations

Open the East River Flood Barrier project to see the main review steps:

1. Check the delay and cost risk scores.
2. See the next milestone and due date.
3. Read the example reasons for concern, such as a permit delay or a shortage of workers.
4. Read a short example from a field report.
5. Consider a suggested next step: arranging a meeting with the agency.
6. Approve or dismiss the suggestion.

Approving or dismissing only changes what you see in the browser. It does not save anything to the database. The field report text is also an example. The “View source document” button does not open a real document yet.

### Notifications and menu

The bell opens a list of example notifications. The sidebar opens views for projects, risk signals, documents, contractors, budget and spend, and help. Project-derived views use data loaded from the API; notifications and document/evidence content remain sample UI data. On a phone, the menu can open and search can be expanded.

## A simple presentation plan

This walkthrough takes about three minutes. You can read the quoted parts as a script.

### 1. Introduce the project

> “ContractPulse AI is a dashboard concept for teams that manage public construction projects. It brings project progress, schedule and cost concerns, supporting reports, and suggested follow-up into one place.”

### 2. Show the overview

Point to the API-backed totals and portfolio progress chart.

> “The overview loads four seeded projects from the Spring Boot API. The totals are calculated from the response, and the chart compares average planned and actual progress by snapshot date.”

Then explain that the figures are sample data.

### 3. Explain the schedule chart and issue list

> “The chart compares planned and actual progress snapshots from the H2 demo database. The signals beside it illustrate the kind of project concerns the product could help explain.”

Be clear that a working AI model is not connected in this version.

### 4. Open a project

Click the East River Flood Barrier signal or its row in the table.

> “The project details show the next milestone, possible reasons for delay, an example report excerpt, and a suggested action. A person can approve or dismiss the suggestion. The person remains in control.”

Click **Approve recommendation** or **Dismiss**.

> “Project, progress, and milestone changes are sent to Spring Boot and stored in the in-memory H2 database until the backend restarts. Approval and dismissal are still browser-only demonstrations and do not persist.”

### 5. Finish

> “This demo connects the frontend to Spring Boot project, milestone, and progress APIs. The next step is durable database storage, authentication, and real document and risk-analysis services.”

## How it is built

- **React** builds the parts of the website and updates them when someone interacts with the page.
- **TypeScript** helps catch mistakes in the data and code while developing.
- **Vite** runs the website during development and creates the files for release.
- **Recharts** draws the schedule chart.
- **Lucide React** provides the icons.
- **Oxlint** checks the code for common issues.
- **Spring Boot** provides project, milestone, and progress REST APIs.
- **H2** stores seeded demo data in memory.

The frontend API client is `src/api.ts`; feature calculations are in `src/projectFeatures.ts`. The backend schema and seed data are in `backend/src/main/resources/`. Risk explanations and recommendation UI remain illustrative.

### Run the project

You need Node.js 20.19 or newer (or Node.js 22.12 or newer) and Java 21 or newer. Open two terminals:

```powershell
# Terminal 1: Spring Boot API
cd backend
.\mvnw.cmd spring-boot:run
```

```powershell
# Terminal 2: React frontend (from the repository root)
npm install
npm run dev
```

The frontend defaults to `http://localhost:5173` and the API to `http://localhost:8080/api`. H2 is reseeded when Spring Boot restarts. To check the frontend build and lint:

```sh
npm run build
npm run lint
```

## Backend coverage and remaining work

| Part of the website | Current demo coverage |
| --- | --- |
| Projects | Project list/detail and create, update, and delete routes are implemented. |
| Milestones | List and create, update, and delete routes are implemented. |
| Progress | Snapshot history and create, update, and delete routes are implemented. |
| Risk assessments | Not connected; sample risk scores and explanations are illustrative. |
| Reports and evidence | Not connected; report excerpts are fixed sample text. |
| Approve or dismiss | Not persisted; the UI updates local state only. |
| Notifications | Not connected; notifications are illustrative. |

This local evaluation backend has no authentication and uses H2 in-memory storage, so changes reset when it is restarted. Before production, define access control, durable database storage, and real data sources.

## Questions to answer before a real release

- What exactly counts as a late project or a cost overrun?
- How far into the future should a warning look?
- Which systems provide the official schedule and cost figures?
- What happens when two reports disagree?
- Which people are allowed to see each project or document?
- What does approving a suggestion mean in the real project process?
- How will the team check that risk scores are useful and not misleading?
- How long should reports and decision records be kept?

## What is not finished yet

- Project, milestone, and progress APIs are implemented, but all database values are seeded demo records.
- There is no real login or role-based access control.
- There is no live AI model making predictions or explanations.
- The report excerpt is fixed sample text; it is not found by searching real documents.
- Approvals and dismissals are not saved. They reset when the page reloads.
- The menu sections for risk explanations, documents, notifications, and recommendations remain demo views.
- Search works on the project records loaded from the demo API.
- The timeframe button does not change the chart data.

This is a full-stack local demo for the project, milestone, and progress portions, with other product capabilities still represented by frontend sample content.

## Possible next steps

1. Replace H2 with a durable database and add authentication/authorization.
2. Connect approved report storage and evidence retrieval.
3. Save approval/dismissal decisions and audit history.
4. Test any real risk model before showing its scores to users.
5. Add server-backed notifications and run user testing.

## Questions an evaluator may ask

### “Does the AI work in this version?”

> “No. This version demonstrates the frontend. The risk scores, reasons, and forecast are sample data. A real model and its testing would be a later step.”

### “Does approving a recommendation save it?”

> “No. It only changes the page in the browser. The backend still needs to save the decision and its history.”

### “Why show a report beside a risk?”

> “People should be able to see what information supports a warning. This demo shows how that could work. The real version would connect to approved documents.”

### “Why does a person approve the suggestion?”

> “Construction decisions can affect public money, project dates, and safety. The dashboard can help people review information, but the responsible person should decide what action to take.”

### “What would you build next?”

> “The project, milestone, and progress APIs are already connected for this demo. I would next replace in-memory H2 with durable storage, add access rules, and connect real reports, risk results, and saved decisions.”

## Short description to remember

> “ContractPulse AI helps public construction teams review project progress and possible schedule and cost problems. This evaluation demo connects a React dashboard to Spring Boot project, milestone, and progress APIs using seeded H2 data. Risk insights and reports are illustrative; durable storage and AI integration are future work.”
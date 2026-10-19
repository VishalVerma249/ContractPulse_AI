# ContractPulse AI

ContractPulse AI is a portfolio dashboard for post-award public infrastructure contract monitoring. The frontend uses a Spring Boot REST API backed by an H2 in-memory database seeded with evaluation demo data. Risk explanations, evidence, recommendations, and risk scores remain illustrative UI content; there is no connected risk model or authentication.

Budget examples are displayed in Indian rupees (INR) using crore units. They are illustrative sample values, not live figures or converted exchange-rate data.

## Run locally

Requirements: Node.js 20.19+ or 22.12+, Java 21+, and Maven 3.9+.

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

The Maven wrapper downloads Maven 3.9.11 automatically on first use. The API is available at `http://localhost:8080/api`; Vite prints the frontend URL after startup. The frontend API base can be changed with `VITE_API_BASE_URL`. H2 runs in memory and is reseeded when the backend restarts. The optional H2 console is at `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:contractpulse`, user `sa`, blank password). Create a production build with `npm run build`; run the configured linter with `npm run lint`. Run backend checks with `.\mvnw.cmd test` from `backend`.

## Dashboard workflows

- Monitor portfolio totals, project progress, schedule signals, and forecasted progress.
- Add a sample project, record progress snapshots, and update milestone status in the browser.
- Search and filter the project table; open a project's risk brief from its row or priority signal.
- Review risk factors and their modeled impact alongside a supporting document excerpt.
- Approve or dismiss the recommended next step; approval is reflected in the client-side audit message.
- Open notifications, switch the forecast timeframe, and navigate the workspace sections.
- Use the responsive navigation and expandable search on mobile.

The dashboard supports project listing and creation/deletion, progress recording, and milestone creation/status updates against the API. The backend also exposes project, progress snapshot, and milestone CRUD routes. These features are a local demo; H2 data is reset on restart.

For an evaluation walkthrough, project explanation, limitations, and likely questions, see [docs/PROJECT_EVALUATION_GUIDE.md](docs/PROJECT_EVALUATION_GUIDE.md).

For a technical description of the frontend files, screen structure, state, interactions, and future API boundary, see [docs/FRONTEND_IMPLEMENTATION.md](docs/FRONTEND_IMPLEMENTATION.md).

For the user journey from portfolio review to project decision, see [docs/PROJECT_WORKFLOW.md](docs/PROJECT_WORKFLOW.md).

## Backend API

`backend/` contains the Spring Boot API and H2 schema/seed data. Routes include `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}`, nested progress snapshot CRUD at `/api/projects/{id}/progress`, and nested milestone CRUD at `/api/projects/{id}/milestones`. The frontend client is in `src/api.ts`.

Progress variance, schedule variance, and milestone delay are calculated from the returned dates and progress values in `src/projectFeatures.ts`; they are explainable demo features, not AI predictions. New projects are marked pending risk review and do not receive fabricated risk scores. Risk evidence and recommendations are still illustrative. Approval and dismissal remain client-side demonstrations and do not persist.
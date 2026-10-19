# ContractPulse AI

> **AI-Powered Infrastructure Contract Intelligence, ML Risk Prediction, and pgvector Evidence Retrieval**

ContractPulse AI is an enterprise-grade platform designed for monitoring post-award public infrastructure contracts. It bridges machine learning risk models (schedule slippage, cost overruns, staffing deficits, weather downtime) with legally binding contract evidence clauses using **Retrieval-Augmented Generation (RAG)** on **PostgreSQL with pgvector**.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │    React 19 + TypeScript + Vite UI     │
                      │  (Portfolio Dashboard & Evidence View) │
                      └──────────────────┬─────────────────────┘
                                         │ HTTP REST
                                         ▼
                      ┌────────────────────────────────────────┐
                      │    Spring Boot 3.3.x Backend (Java)    │
                      │   - MLEvidenceService (Semantic RAG)   │
                      │   - DocumentIntelligenceService        │
                      │   - StorageService (MinIO / S3)        │
                      └──────────┬──────────────────┬──────────┘
                                 │                  │
                pgvector Cosine  │                  │ S3 API
                Similarity (<=>) │                  │
                                 ▼                  ▼
               ┌──────────────────────┐    ┌──────────────────────┐
               │ PostgreSQL (pgvector)│    │   MinIO / S3 Store   │
               │  - contract_clauses  │    │  (Uploaded Contract  │
               │  - document_metadata │    │       PDFs/Docs)     │
               └──────────────────────┘    └──────────────────────┘
```

---

## Key Features

### 1. ML Risk-to-Evidence Connection (Core ML Module)
- **Problem**: Machine learning models often predict risk scores (e.g. 78% schedule slippage) without providing the legal context or contractual clauses governing that risk.
- **Solution**: The `POST /api/ml/connect-evidence` service receives predicted risk metrics (`project_id`, `risk_type`, `risk_description`, `risk_score`) and queries `pgvector` using cosine distance (`<=>`) to retrieve the governing contract clauses.
- **Explainability**: Automatically generates an operational/legal connection rationale explaining *why* the contract clause holds the contractor liable and what mitigation timelines apply.

### 2. Document Intelligence & Retrieval
- **Document Ingestion**: Uploads contract agreements (PDF/DOCX) into MinIO/S3 object storage.
- **Clause Segmentation**: Parses contract documents into granular numbered clauses, extracts metadata (page numbers, section titles), and creates 1536-dimensional vector embeddings.
- **Semantic Clause Search**: Dedicated search interface to query clauses across contracts (e.g. "environmental permit lag", "steel escalation index", "hydrostatic pressure test").

### 3. Executive Decision Support Dashboard
- **Portfolio Health & Forecasts**: Real-time progress baseline vs. projected completion charts powered by Recharts.
- **Interactive Risk Factor Drill-down**: Click on any project or risk signal to open the **Project Risk Brief**, dynamically inspect governing contract clauses, and approve/dismiss AI recommendations with audit logging.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Recharts, Lucide Icons |
| **Backend** | Java 21+, Spring Boot 3.3.x, Spring Data JPA, Hibernate, Spring Web |
| **Vector Database** | PostgreSQL 16+ with `pgvector` extension |
| **Object Storage** | MinIO / AWS S3 (with local filesystem fallback) |
| **AI / Embeddings** | OpenAI `text-embedding-3-small` + deterministic offline semantic dense vector fallback |
| **Build Tools** | Maven 3.9+, Node.js 20+, Docker |

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v20+ recommended)
- **Java Development Kit (JDK 21 or 24)**
- **Docker Desktop** (for PostgreSQL + pgvector)

---

### 2. Start PostgreSQL with `pgvector`
Run the following Docker command to launch the vector-enabled PostgreSQL instance:
```powershell
docker run --name pgvector-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=contractpulse -p 5432:5432 -d pgvector/pgvector:pg16
```
*(If the container is already created, simply run `docker start pgvector-db`)*.

---

### 3. Run the Spring Boot Backend
Navigate to the `backend-spring` directory:
```powershell
cd backend-spring
```

Run with the Maven wrapper:
```powershell
.\mvnw.cmd spring-boot:run
```
*(Or open `backend-spring` in IntelliJ IDEA / VS Code / Eclipse and run `ContractPulseApplication.java`)*.

The backend will start on **`http://localhost:8080`**.
On startup, it automatically:
- Executes `CREATE EXTENSION IF NOT EXISTS vector` in PostgreSQL.
- Seeds realistic contract clauses and metadata for the 4 demo projects if the database is empty.

---

### 4. Run the React Frontend
In a separate terminal, navigate to the project root:
```powershell
npm install
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## API Reference

### 1. Connect ML Risk to Contract Evidence
- **Method & Path**: `POST /api/ml/connect-evidence`
- **Request Body**:
  ```json
  {
    "project_id": "CP-2048",
    "risk_type": "Schedule slippage",
    "factor_title": "Permit approval lag",
    "risk_description": "Environmental review is 23 days behind baseline. NYS DEC Article 15 permit issuance delayed.",
    "risk_score": 78.0
  }
  ```
- **Response**:
  ```json
  [
    {
      "clause_id": 1,
      "project_id": "CP-2048",
      "document_id": "DOC-ERFB-001",
      "document_name": "East River Barrier - General Contract Agreement.pdf",
      "section_title": "Section 14.2: Environmental Permits & Stop-Work Liability",
      "page_number": 42,
      "clause_text": "Foundation construction in the East River intertidal zone shall not proceed without active NYS DEC Article 15 and USACE Section 10 permits...",
      "similarity_score": 0.942,
      "connection_rationale": "The ML model detected a 78% schedule slippage risk. Section 14.2 directly governs this condition..."
    }
  ]
  ```

### 2. Search Contract Clauses
- **Method & Path**: `GET /api/documents/clauses?q={searchQuery}&project_id={projectId}`
- **Response**: List of clauses matched via vector semantic similarity.

### 3. Ingest Contract Document
- **Method & Path**: `POST /api/documents/upload`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file`, `project_id`, `uploaded_by`

### 4. Health Check
- **Method & Path**: `GET /api/health`
- **Response**: `{"status": "UP", "service": "ContractPulse AI Spring Boot Backend", "rag_engine": "PostgreSQL + pgvector"}`

---

## Testing the ML Pipeline Directly via Python

A standalone script is provided in `backend/simulate_ml_model.py` to simulate an automated ML model sending predictions and retrieving contract citations:
```powershell
python backend/simulate_ml_model.py
```

---

## Team Division & Contribution

- **ML Risk-to-Evidence Connection & Spring Boot Backend**:
  - Implemented `MLEvidenceService` and pgvector cosine similarity search (`<=>`).
  - Integrated dynamic evidence citation cards and rationale explanations into the frontend drawer.
  - Built the Spring Boot REST API, database entity mappings, and local/OpenAI embedding fallback pipeline.
- **Document Intelligence Ingestion (Suhani)**:
  - Document upload endpoint (`/api/documents/upload`), MinIO/S3 document persistence, and document metadata tracking.

---

## License
MIT License. Developed for Academic Mini-Project 2026.
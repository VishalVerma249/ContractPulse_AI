# ContractPulse AI - Spring Boot Backend

Complete enterprise backend for **ContractPulse AI**, implemented in **Spring Boot 3.3.x / Java 21+** with **PostgreSQL**, **pgvector**, and **MinIO/S3**.

---

## Architecture Overview

```
Frontend (React + Vite + Recharts)
   │
   ├── [POST] /api/ml/connect-evidence  ────► MLEvidenceService (RAG Semantic Retrieval)
   │                                                 │
   ├── [GET]  /api/documents/clauses   ────► pgvector Cosine Search (<=>)
   │                                                 │
   └── [POST] /api/documents/upload    ────► MinIO / S3 Document Object Storage
```

### Components

1. **`MLEvidenceService` & `MLEvidenceController` (Your Main Responsibility)**
   - Receives ML model risk predictions (`project_id`, `risk_type`, `risk_description`, `risk_score`).
   - Converts risk context into a 1536-dimensional vector embedding.
   - Executes semantic cosine similarity search against `pgvector` in PostgreSQL.
   - Generates legal & operational connection rationales tying the ML risk factor directly to contract clauses.

2. **`DocumentIntelligenceService` & `DocumentController` (Suhani's Module)**
   - Multipart document upload API (`POST /api/documents/upload`).
   - Stores PDF/Word contracts in MinIO S3 object storage (with local disk fallback).
   - Segments contract text into numbered clauses and computes vector embeddings.
   - Tracks document metadata in the `document_metadata` table.

3. **`EmbeddingService`**
   - Connects to OpenAI Embeddings API (`text-embedding-3-small`) when `OPENAI_API_KEY` is present.
   - Uses high-reliability deterministic dense vector hashing when offline or without an API key, guaranteeing 100% demo uptime.

4. **`DataInitializer`**
   - Automatically enables the PostgreSQL `vector` extension on startup (`CREATE EXTENSION IF NOT EXISTS vector`).
   - Pre-seeds realistic project contract clauses and document metadata for all 4 demo projects (East River Barrier, I-405 Sound Wall, Civic Center, South County Water Main).

---

## Prerequisites

1. **Java Development Kit (JDK 21 or higher)**
   - Check with: `java -version`
2. **PostgreSQL with pgvector (via Docker)**
   ```powershell
   docker run --name pgvector-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=contractpulse -p 5432:5432 -d pgvector/pgvector:pg16
   ```

---

## Running the Application

### Option 1: In IntelliJ IDEA, VS Code, or Eclipse
1. Open the `backend-spring` folder as a Maven project.
2. Run `com.contractpulse.ContractPulseApplication`.
3. The server starts on **`http://localhost:8080`**.

### Option 2: Command Line (Maven)
If Maven is installed:
```powershell
cd backend-spring
mvn clean spring-boot:run
```

---

## API Endpoints

### 1. ML Evidence Connection (Your Primary Feature)
- **Endpoint**: `POST /api/ml/connect-evidence`
- **Request Body**:
  ```json
  {
    "project_id": "CP-2048",
    "risk_type": "Schedule slippage",
    "factor_title": "Permit approval lag",
    "risk_description": "Environmental review is 23 days behind baseline. Foundation work cannot proceed.",
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

### 2. Document Upload API
- **Endpoint**: `POST /api/documents/upload`
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `file` (File), `project_id` (String), `uploaded_by` (String)

### 3. List Uploaded Documents
- **Endpoint**: `GET /api/documents`
- **Query Params**: `?project_id=CP-2048` (optional)

### 4. Search Contract Clauses
- **Endpoint**: `GET /api/documents/clauses`
- **Query Params**: `?q=permit&project_id=CP-2048`

### 5. Health Check
- **Endpoint**: `GET /api/health`

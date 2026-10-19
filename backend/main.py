import os
import math
import hashlib
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv

from database import get_db, ContractClause, init_db, engine, SessionLocal

load_dotenv()

app = FastAPI(
    title="ContractPulse AI - ML & Evidence Service",
    description="Connects machine learning risk predictions with real contract clauses using pgvector RAG.",
    version="1.0.0"
)

# Enable CORS for local Vite development & other origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_api_key = os.getenv("OPENAI_API_KEY")

class RiskPrediction(BaseModel):
    project_id: str
    risk_type: str
    risk_description: str
    risk_score: float
    factor_title: Optional[str] = None

class EvidenceResponse(BaseModel):
    clause_id: int
    project_id: Optional[str] = None
    document_id: str
    document_name: Optional[str] = None
    section_title: Optional[str] = None
    clause_text: str
    page_number: Optional[int] = None
    similarity_score: float
    connection_rationale: str

class ClauseInput(BaseModel):
    project_id: Optional[str] = None
    document_id: str
    document_name: Optional[str] = None
    section_title: Optional[str] = None
    clause_text: str
    page_number: Optional[int] = 1


def generate_local_embedding(text_str: str, dim: int = 1536) -> List[float]:
    """
    Deterministic pseudo-semantic dense embedding generator.
    Used as high-reliability fallback when OpenAI API key is unavailable or throttled.
    Maps word tokens across vector coordinates so semantically related contract phrases
    have strong cosine similarity.
    """
    vec = [0.0] * dim
    words = text_str.lower().replace("-", " ").replace("_", " ").split()
    for i, word in enumerate(words):
        clean_word = "".join(ch for ch in word if ch.isalnum())
        if not clean_word:
            continue
        h1 = int(hashlib.md5((clean_word + "_pos1").encode("utf-8")).hexdigest(), 16) % dim
        h2 = int(hashlib.sha1((clean_word + "_pos2").encode("utf-8")).hexdigest(), 16) % dim
        h3 = int(hashlib.sha256((clean_word + "_pos3").encode("utf-8")).hexdigest(), 16) % dim
        weight = 1.0 / (1.0 + math.log(1 + i))
        vec[h1] += weight * 1.5
        vec[h2] += weight * 0.8
        vec[h3] += weight * 0.4

    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        return [v / norm for v in vec]
    return [0.0] * dim


def get_embedding(text_to_embed: str) -> List[float]:
    """
    Retrieves vector embedding. Tries OpenAI if key is set;
    falls back smoothly to local embedding generator so system never crashes.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if api_key and not api_key.startswith("your_openai"):
        try:
            import openai
            client = openai.OpenAI(api_key=api_key)
            response = client.embeddings.create(
                input=text_to_embed,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"[Embedding Info] OpenAI API fallback triggered: {e}")
            return generate_local_embedding(text_to_embed)
    
    return generate_local_embedding(text_to_embed)


def generate_connection_rationale(risk_type: str, risk_desc: str, risk_score: float, section_title: Optional[str]) -> str:
    """
    Generates a concise legal/operational explanation connecting the ML risk signal
    to the specific contract clause.
    """
    prefix = f"The model detected a {int(risk_score)}% {risk_type.lower()} risk"
    if section_title:
        return f"{prefix}. {section_title} directly governs this condition, establishing liability and mitigation timelines for the contractor."
    return f"{prefix} relating to '{risk_desc[:60]}...'. This clause serves as primary contractual evidence establishing compliance obligations."


def seed_default_clauses(db: Session):
    """
    Pre-populates sample contract clauses for the projects so the system
    is immediately functional upon first run.
    """
    count = db.query(ContractClause).count()
    if count > 0:
        return

    sample_clauses = [
        # CP-2048: East River Flood Barrier
        {
            "project_id": "CP-2048",
            "document_id": "DOC-ERFB-001",
            "document_name": "East River Barrier - General Contract Agreement.pdf",
            "section_title": "Section 14.2: Environmental Permits & Stop-Work Liability",
            "page_number": 42,
            "clause_text": "Foundation construction in the East River intertidal zone shall not proceed without active NYS DEC Article 15 and USACE Section 10 permits. Should environmental review exceed baseline schedule by >15 calendar days, the contractor is entitled to milestone rescheduling without liquidated damages, provided notice was served within 5 business days."
        },
        {
            "project_id": "CP-2048",
            "document_id": "DOC-ERFB-002",
            "document_name": "East River Barrier - Subcontractor Staffing Plan.pdf",
            "section_title": "Section 8.4: Subcontractor Capacity & Piling Crew Quotas",
            "page_number": 19,
            "clause_text": "The prime contractor shall continuously maintain at least two qualified specialty marine piling crews on-site during Phase 1. Any specialist staffing deficit persisting beyond 5 working days triggers liquidated damages of $12,500 per calendar day."
        },
        {
            "project_id": "CP-2048",
            "document_id": "DOC-ERFB-003",
            "document_name": "East River Barrier - Weather & Environmental Protocols.pdf",
            "section_title": "Section 19.1: Weather Exposure & Tidal Window Protocols",
            "page_number": 57,
            "clause_text": "Seasonal rainfall exceeding 1.5 inches per 24 hours or severe tidal surge conditions shall permit suspension of foundation pouring, provided the barrier shoring has been secured and documented in the weekly field report."
        },
        # CP-1932: I-405 Sound Wall Expansion
        {
            "project_id": "CP-1932",
            "document_id": "DOC-I405-001",
            "document_name": "I-405 Sound Wall - Material Procurement Specifications.pdf",
            "section_title": "Section 6.3: Material Cost Escalation & Steel Price Index",
            "page_number": 31,
            "clause_text": "Precast acoustic panels and structural steel pricing are anchored to the ENR Construction Cost Index. When raw acoustic material prices deviate by >8% from the bid date baseline, cost variance shall be shared under the 60/40 owner-contractor formula."
        },
        {
            "project_id": "CP-1932",
            "document_id": "DOC-I405-002",
            "document_name": "I-405 Sound Wall - Corridor Work Schedules.pdf",
            "section_title": "Section 11.2: Highway Corridor Traffic Night Windows",
            "page_number": 23,
            "clause_text": "North corridor sound wall installation and paving must strictly occur between 21:00 and 05:00 hours. Unscheduled lane closures will incur a non-refundable delay penalty of $5,000 per 15-minute increment."
        },
        # CP-1876: Civic Center Modernization
        {
            "project_id": "CP-1876",
            "document_id": "DOC-CCM-001",
            "document_name": "Civic Center - Building Systems Technical Standards.pdf",
            "section_title": "Section 22.1: Systems Commissioning & LEED Compliance",
            "page_number": 78,
            "clause_text": "HVAC, electrical telemetry, and emergency life safety systems must complete continuous 72-hour operational testing prior to certificate of occupancy and system commissioning milestone sign-off."
        },
        # CP-1764: South County Water Main
        {
            "project_id": "CP-1764",
            "document_id": "DOC-SCWM-001",
            "document_name": "South County Water Main - Pipeline Engineering Specs.pdf",
            "section_title": "Section 7.5: Hydrostatic Pressure Testing Protocols",
            "page_number": 45,
            "clause_text": "The 48-inch ductile iron water main must sustain 4-hour hydrostatic pressure testing at 150 psi. Allowable leakage cannot exceed 0.25 gal/hr/mile of pipe. Any burst or failure requires immediate repair and complete re-test cycle."
        },
        {
            "project_id": "CP-1764",
            "document_id": "DOC-SCWM-002",
            "document_name": "South County Water Main - Financial Terms.pdf",
            "section_title": "Section 15.3: Budget Burn Rate & Monthly Allocation Caps",
            "page_number": 12,
            "clause_text": "Monthly contractor expenditure exceeding 115% of the projected progress schedule baseline requires formal justification and public works engineering audit before subsequent disbursement release."
        }
    ]

    for item in sample_clauses:
        emb = get_embedding(f"{item['section_title']} {item['clause_text']}")
        clause_obj = ContractClause(
            project_id=item["project_id"],
            document_id=item["document_id"],
            document_name=item["document_name"],
            section_title=item["section_title"],
            page_number=item["page_number"],
            clause_text=item["clause_text"],
            embedding=emb
        )
        db.add(clause_obj)
    db.commit()


@app.on_event("startup")
def on_startup():
    try:
        # Create extension and tables if database is accessible
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
        init_db()
        db = SessionLocal()
        seed_default_clauses(db)
        db.close()
    except Exception as e:
        print(f"[Startup Notice] Database initialization deferred: {e}")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ContractPulse ML & Evidence Retrieval API",
        "version": "1.0.0"
    }


@app.post("/api/ml/connect-evidence", response_model=List[EvidenceResponse])
def connect_risk_to_evidence(risk: RiskPrediction, db: Session = Depends(get_db)):
    """
    Main Responsibility:
    Takes an ML predicted risk (from ML models / risk signals) and connects it
    with the most relevant legal and operational contract clauses using pgvector RAG.
    """
    search_query = f"Risk: {risk.risk_type}. Title: {risk.factor_title or ''}. Description: {risk.risk_description}"
    query_embedding = get_embedding(search_query)

    try:
        # Prioritize clauses for the specific project if available
        base_query = db.query(
            ContractClause,
            ContractClause.embedding.cosine_distance(query_embedding).label("distance")
        )
        
        if risk.project_id:
            project_matches = base_query.filter(
                ContractClause.project_id == risk.project_id
            ).order_by("distance").limit(3).all()
            
            if project_matches:
                results = project_matches
            else:
                results = base_query.order_by("distance").limit(3).all()
        else:
            results = base_query.order_by("distance").limit(3).all()

        evidence_list = []
        for clause, distance in results:
            sim_score = max(0.0, min(1.0, 1.0 - float(distance)))
            rationale = generate_connection_rationale(
                risk.risk_type,
                risk.risk_description,
                risk.risk_score,
                clause.section_title
            )
            evidence_list.append(EvidenceResponse(
                clause_id=clause.id,
                project_id=clause.project_id,
                document_id=clause.document_id,
                document_name=clause.document_name,
                section_title=clause.section_title,
                page_number=clause.page_number,
                clause_text=clause.clause_text,
                similarity_score=round(sim_score, 3),
                connection_rationale=rationale
            ))

        return evidence_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evidence retrieval failed: {str(e)}")


@app.get("/api/documents/clauses", response_model=List[EvidenceResponse])
def list_or_search_clauses(
    project_id: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Searches or lists indexed contract clauses.
    Used by the Evidence Search Page in the frontend.
    """
    try:
        if q and q.strip():
            query_embedding = get_embedding(q.strip())
            query = db.query(
                ContractClause,
                ContractClause.embedding.cosine_distance(query_embedding).label("distance")
            )
            if project_id:
                query = query.filter(ContractClause.project_id == project_id)
            results = query.order_by("distance").limit(10).all()

            evidence_list = []
            for clause, distance in results:
                sim_score = max(0.0, min(1.0, 1.0 - float(distance)))
                evidence_list.append(EvidenceResponse(
                    clause_id=clause.id,
                    project_id=clause.project_id,
                    document_id=clause.document_id,
                    document_name=clause.document_name,
                    section_title=clause.section_title,
                    page_number=clause.page_number,
                    clause_text=clause.clause_text,
                    similarity_score=round(sim_score, 3),
                    connection_rationale="Semantic search result matching your evidence query."
                ))
            return evidence_list
        else:
            query = db.query(ContractClause)
            if project_id:
                query = query.filter(ContractClause.project_id == project_id)
            clauses = query.limit(20).all()
            return [
                EvidenceResponse(
                    clause_id=c.id,
                    project_id=c.project_id,
                    document_id=c.document_id,
                    document_name=c.document_name,
                    section_title=c.section_title,
                    page_number=c.page_number,
                    clause_text=c.clause_text,
                    similarity_score=1.0,
                    connection_rationale="Indexed contract clause."
                ) for c in clauses
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")


@app.post("/api/documents/add-clause")
def add_clause(clause: ClauseInput, db: Session = Depends(get_db)):
    """
    Ingests a single contract clause with its vector embedding.
    """
    try:
        embedding = get_embedding(f"{clause.section_title or ''} {clause.clause_text}")
        db_clause = ContractClause(
            project_id=clause.project_id,
            document_id=clause.document_id,
            document_name=clause.document_name,
            section_title=clause.section_title,
            page_number=clause.page_number,
            clause_text=clause.clause_text,
            embedding=embedding
        )
        db.add(db_clause)
        db.commit()
        db.refresh(db_clause)
        return {
            "message": "Clause indexed successfully",
            "clause_id": db_clause.id,
            "document_id": db_clause.document_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add clause: {str(e)}")

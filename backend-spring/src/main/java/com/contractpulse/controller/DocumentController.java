package com.contractpulse.controller;

import com.contractpulse.dto.ClauseInputRequest;
import com.contractpulse.dto.DocumentUploadResponse;
import com.contractpulse.dto.EvidenceResponse;
import com.contractpulse.model.ContractClause;
import com.contractpulse.model.DocumentMetadata;
import com.contractpulse.repository.ContractClauseRepository;
import com.contractpulse.repository.DocumentMetadataRepository;
import com.contractpulse.service.DocumentIntelligenceService;
import com.contractpulse.service.EmbeddingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentIntelligenceService documentIntelligenceService;
    private final DocumentMetadataRepository metadataRepository;
    private final ContractClauseRepository clauseRepository;
    private final EmbeddingService embeddingService;

    public DocumentController(DocumentIntelligenceService documentIntelligenceService,
                              DocumentMetadataRepository metadataRepository,
                              ContractClauseRepository clauseRepository,
                              EmbeddingService embeddingService) {
        this.documentIntelligenceService = documentIntelligenceService;
        this.metadataRepository = metadataRepository;
        this.clauseRepository = clauseRepository;
        this.embeddingService = embeddingService;
    }

    /**
     * Document Upload API: Accepts contract files and ingests them into MinIO and pgvector
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "project_id", required = false, defaultValue = "CP-2048") String projectId,
            @RequestParam(value = "uploaded_by", required = false, defaultValue = "Program Director") String uploadedBy
    ) {
        try {
            DocumentUploadResponse response = documentIntelligenceService.processAndIngestDocument(file, projectId, uploadedBy);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Document upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    /**
     * Uploaded Documents List: Returns metadata of all ingested contracts
     */
    @GetMapping
    public ResponseEntity<List<DocumentMetadata>> listDocuments(
            @RequestParam(value = "project_id", required = false) String projectId
    ) {
        if (projectId != null && !projectId.isBlank() && !projectId.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(metadataRepository.findByProjectId(projectId));
        }
        return ResponseEntity.ok(metadataRepository.findAllByOrderByUploadedAtDesc());
    }

    /**
     * Search / Evidence Page: Searches indexed clauses via pgvector semantic search
     */
    @GetMapping("/clauses")
    public ResponseEntity<List<EvidenceResponse>> searchClauses(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "project_id", required = false) String projectId
    ) {
        List<EvidenceResponse> results = documentIntelligenceService.searchClauses(query, projectId);
        return ResponseEntity.ok(results);
    }

    /**
     * Ingest single clause directly
     */
    @PostMapping("/add-clause")
    public ResponseEntity<Map<String, Object>> addClause(@RequestBody ClauseInputRequest request) {
        String embedding = embeddingService.getEmbeddingVectorString(
                (request.getSectionTitle() != null ? request.getSectionTitle() : "") + " " + request.getClauseText()
        );

        ContractClause clause = new ContractClause(
                request.getProjectId(),
                request.getDocumentId(),
                request.getDocumentName(),
                request.getSectionTitle(),
                request.getClauseText(),
                request.getPageNumber() != null ? request.getPageNumber() : 1,
                embedding
        );

        ContractClause saved = clauseRepository.save(clause);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Clause indexed successfully");
        resp.put("clause_id", saved.getId());
        resp.put("document_id", saved.getDocumentId());
        return ResponseEntity.ok(resp);
    }
}

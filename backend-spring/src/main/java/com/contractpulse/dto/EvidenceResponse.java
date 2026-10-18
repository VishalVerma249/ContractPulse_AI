package com.contractpulse.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EvidenceResponse {

    @JsonProperty("clause_id")
    private Long clauseId;

    @JsonProperty("project_id")
    private String projectId;

    @JsonProperty("document_id")
    private String documentId;

    @JsonProperty("document_name")
    private String documentName;

    @JsonProperty("section_title")
    private String sectionTitle;

    @JsonProperty("clause_text")
    private String clauseText;

    @JsonProperty("page_number")
    private Integer pageNumber;

    @JsonProperty("similarity_score")
    private Double similarityScore;

    @JsonProperty("connection_rationale")
    private String connectionRationale;

    public EvidenceResponse() {}

    public EvidenceResponse(Long clauseId, String projectId, String documentId,
                            String documentName, String sectionTitle, String clauseText,
                            Integer pageNumber, Double similarityScore, String connectionRationale) {
        this.clauseId = clauseId;
        this.projectId = projectId;
        this.documentId = documentId;
        this.documentName = documentName;
        this.sectionTitle = sectionTitle;
        this.clauseText = clauseText;
        this.pageNumber = pageNumber;
        this.similarityScore = similarityScore;
        this.connectionRationale = connectionRationale;
    }

    public Long getClauseId() { return clauseId; }
    public void setClauseId(Long clauseId) { this.clauseId = clauseId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getSectionTitle() { return sectionTitle; }
    public void setSectionTitle(String sectionTitle) { this.sectionTitle = sectionTitle; }

    public String getClauseText() { return clauseText; }
    public void setClauseText(String clauseText) { this.clauseText = clauseText; }

    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }

    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }

    public String getConnectionRationale() { return connectionRationale; }
    public void setConnectionRationale(String connectionRationale) { this.connectionRationale = connectionRationale; }
}

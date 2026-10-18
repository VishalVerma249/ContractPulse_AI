package com.contractpulse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "contract_clauses")
public class ContractClause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id")
    private String projectId;

    @Column(name = "document_id")
    private String documentId;

    @Column(name = "document_name")
    private String documentName;

    @Column(name = "section_title")
    private String sectionTitle;

    @Column(name = "clause_text", columnDefinition = "TEXT")
    private String clauseText;

    @Column(name = "page_number")
    private Integer pageNumber;

    @Column(name = "embedding", columnDefinition = "vector(1536)")
    private String embedding;

    public ContractClause() {}

    public ContractClause(String projectId, String documentId, String documentName,
                          String sectionTitle, String clauseText, Integer pageNumber, String embedding) {
        this.projectId = projectId;
        this.documentId = documentId;
        this.documentName = documentName;
        this.sectionTitle = sectionTitle;
        this.clauseText = clauseText;
        this.pageNumber = pageNumber;
        this.embedding = embedding;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getEmbedding() { return embedding; }
    public void setEmbedding(String embedding) { this.embedding = embedding; }
}

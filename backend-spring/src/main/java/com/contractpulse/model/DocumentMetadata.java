package com.contractpulse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_metadata")
public class DocumentMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id", unique = true, nullable = false)
    private String documentId;

    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Column(name = "project_id")
    private String projectId;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "storage_url")
    private String storageUrl;

    @Column(name = "clause_count")
    private Integer clauseCount;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    public DocumentMetadata() {
        this.uploadedAt = LocalDateTime.now();
    }

    public DocumentMetadata(String documentId, String documentName, String projectId,
                            String contentType, Long fileSize, String storageUrl,
                            Integer clauseCount, String uploadedBy) {
        this.documentId = documentId;
        this.documentName = documentName;
        this.projectId = projectId;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.storageUrl = storageUrl;
        this.clauseCount = clauseCount;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getStorageUrl() { return storageUrl; }
    public void setStorageUrl(String storageUrl) { this.storageUrl = storageUrl; }

    public Integer getClauseCount() { return clauseCount; }
    public void setClauseCount(Integer clauseCount) { this.clauseCount = clauseCount; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}

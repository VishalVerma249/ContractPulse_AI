package com.contractpulse.repository;

import com.contractpulse.model.DocumentMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentMetadataRepository extends JpaRepository<DocumentMetadata, Long> {
    Optional<DocumentMetadata> findByDocumentId(String documentId);
    List<DocumentMetadata> findByProjectId(String projectId);
    List<DocumentMetadata> findAllByOrderByUploadedAtDesc();
}

package com.contractpulse.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class StorageService {

    @Value("${contractpulse.minio.endpoint:http://localhost:9000}")
    private String minioEndpoint;

    @Value("${contractpulse.minio.access-key:minioadmin}")
    private String minioAccessKey;

    @Value("${contractpulse.minio.secret-key:minioadmin}")
    private String minioSecretKey;

    @Value("${contractpulse.minio.bucket:contracts}")
    private String bucketName;

    @Value("${contractpulse.storage.local-dir:./storage/contracts}")
    private String localDir;

    private MinioClient minioClient;
    private boolean minioAvailable = false;

    private synchronized void initMinio() {
        if (minioClient != null) return;
        try {
            minioClient = MinioClient.builder()
                    .endpoint(minioEndpoint)
                    .credentials(minioAccessKey, minioSecretKey)
                    .build();

            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            minioAvailable = true;
            System.out.println("[StorageService] Connected to MinIO S3 bucket: " + bucketName);
        } catch (Exception e) {
            System.out.println("[StorageService] MinIO not available. Using local file storage fallback (" + localDir + ")");
            minioAvailable = false;
        }
    }

    public String storeFile(MultipartFile file, String documentId) throws Exception {
        initMinio();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String objectName = documentId + "_" + originalFilename;

        if (minioAvailable && minioClient != null) {
            try (InputStream is = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .stream(is, file.getSize(), -1)
                                .contentType(file.getContentType())
                                .build()
                );
                return minioEndpoint + "/" + bucketName + "/" + objectName;
            } catch (Exception e) {
                System.err.println("[StorageService] Failed to upload to MinIO, falling back to local: " + e.getMessage());
            }
        }

        // Local storage fallback
        Path directoryPath = Paths.get(localDir);
        if (!Files.exists(directoryPath)) {
            Files.createDirectories(directoryPath);
        }
        Path destination = directoryPath.resolve(objectName);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return destination.toAbsolutePath().toString();
    }
}

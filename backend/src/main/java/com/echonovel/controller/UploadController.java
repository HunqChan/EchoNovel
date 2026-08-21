package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.response.UploadResponse;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

/**
 * Controller for general-purpose image uploads to Cloudinary.
 * Validates file type (JPG, PNG, WebP) and size (max 5MB).
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );

    private final CloudinaryService cloudinaryService;

    @PostMapping("/image")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "echonovel/general") String folder) {

        validateImageFile(file);

        Map<String, String> result = cloudinaryService.uploadImage(file, folder);

        UploadResponse response = UploadResponse.builder()
                .url(result.get("url"))
                .publicId(result.get("publicId"))
                .build();

        return ResponseEntity.ok(ApiResponse.success("Upload ảnh thành công", response));
    }

    /**
     * Validate image file: content type and size.
     */
    public static void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }
    }
}

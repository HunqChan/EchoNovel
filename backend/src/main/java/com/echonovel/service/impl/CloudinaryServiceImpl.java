package com.echonovel.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Implementation of CloudinaryService.
 * Handles image upload with automatic bandwidth optimization (f_auto, q_auto),
 * image deletion, and optimized URL generation with smart cropping.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadImage(MultipartFile file, String folderName) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folderName,
                    "resource_type", "image",
                    "transformation", new Transformation<>()
                            .quality("auto")
                            .fetchFormat("auto")
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            log.info("Image uploaded to Cloudinary: folder={}, publicId={}", folderName, publicId);

            Map<String, String> result = new HashMap<>();
            result.put("url", secureUrl);
            result.put("publicId", publicId);
            return result;
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    @Override
    public void deleteImage(String publicId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted from Cloudinary: publicId={}, result={}", publicId, result.get("result"));
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: publicId={}, error={}", publicId, e.getMessage(), e);
            // Don't throw here - deletion failure shouldn't block user operations
        }
    }

    @Override
    public String getOptimizedUrl(String publicId, int width, int height, String cropMode) {
        return cloudinary.url()
                .transformation(new Transformation<>()
                        .width(width)
                        .height(height)
                        .crop(cropMode)
                        .gravity("auto")
                        .quality("auto")
                        .fetchFormat("auto")
                )
                .secure(true)
                .generate(publicId);
    }
}

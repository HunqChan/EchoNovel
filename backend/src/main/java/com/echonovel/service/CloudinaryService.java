package com.echonovel.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Service interface for Cloudinary image upload, deletion, and URL optimization.
 */
public interface CloudinaryService {

    /**
     * Upload an image file to Cloudinary with automatic format and quality optimization.
     *
     * @param file       the image file to upload
     * @param folderName the Cloudinary folder (e.g. "echonovel/avatars", "echonovel/covers")
     * @return a map containing "url" (secure URL) and "publicId" (Cloudinary public ID)
     */
    Map<String, String> uploadImage(MultipartFile file, String folderName);

    /**
     * Delete an image from Cloudinary by its public ID.
     *
     * @param publicId the Cloudinary public ID of the image to delete
     */
    void deleteImage(String publicId);

    /**
     * Generate an optimized URL for a Cloudinary image with resizing and smart cropping.
     * Automatically applies f_auto (format) and q_auto (quality) for bandwidth savings.
     *
     * @param publicId the Cloudinary public ID
     * @param width    desired width in pixels
     * @param height   desired height in pixels
     * @param cropMode crop mode (e.g. "fill", "fit", "thumb")
     * @return the optimized image URL
     */
    String getOptimizedUrl(String publicId, int width, int height, String cropMode);
}

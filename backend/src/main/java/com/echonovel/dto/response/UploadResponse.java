package com.echonovel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for image upload operations.
 * Contains the optimized URL and public ID for future management (e.g. deletion).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadResponse {
    private String url;
    private String publicId;
}

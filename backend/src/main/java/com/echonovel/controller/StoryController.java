package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.request.StoryRequest;
import com.echonovel.dto.response.StoryResponse;
import com.echonovel.service.StoryService;
import com.echonovel.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;
    private final WalletService walletService;

    // ==================== PUBLIC APIs ====================

    @GetMapping("/api/stories")
    public ResponseEntity<ApiResponse<Page<StoryResponse>>> getStories(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) java.util.List<Long> genreIds,
            @RequestParam(required = false) com.echonovel.enums.StoryStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        Page<StoryResponse> data = storyService.getStories(keyword, genreIds, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/api/stories/{id}")
    public ResponseEntity<ApiResponse<StoryResponse>> getStoryById(@PathVariable Long id) {
        StoryResponse data = storyService.getStoryById(id);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/api/stories/{id}/buy")
    public ResponseEntity<ApiResponse<Void>> buyStory(Authentication authentication, @PathVariable Long id) {
        walletService.buyStory(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Mua truyện thành công", null));
    }

    @GetMapping("/api/stories/{id}/recommendations")
    public ResponseEntity<ApiResponse<java.util.List<StoryResponse>>> getRecommendations(@PathVariable Long id) {
        java.util.List<StoryResponse> data = storyService.getRecommendations(id);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ==================== ADMIN APIs ====================

    @PostMapping("/api/admin/stories")
    public ResponseEntity<ApiResponse<StoryResponse>> createStory(
            @Valid @RequestBody StoryRequest request) {
        StoryResponse data = storyService.createStory(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo truyện thành công", data));
    }

    @PutMapping("/api/admin/stories/{id}")
    public ResponseEntity<ApiResponse<StoryResponse>> updateStory(
            @PathVariable Long id,
            @Valid @RequestBody StoryRequest request) {
        StoryResponse data = storyService.updateStory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật truyện thành công", data));
    }

    @DeleteMapping("/api/admin/stories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStory(@PathVariable Long id) {
        storyService.deleteStory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa truyện thành công", null));
    }

    /**
     * Upload cover image for a story via Cloudinary.
     * Accepts JPG, PNG, WebP files up to 5MB.
     */
    @PostMapping("/api/admin/stories/{id}/cover")
    public ResponseEntity<ApiResponse<StoryResponse>> uploadCoverImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        UploadController.validateImageFile(file);
        StoryResponse data = storyService.updateCoverImage(id, file);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ảnh bìa thành công", data));
    }
}

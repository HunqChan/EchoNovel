package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.request.ChapterRequest;
import com.echonovel.dto.response.ChapterResponse;
import com.echonovel.service.ChapterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    // ==================== PUBLIC APIs ====================

    @GetMapping("/api/chapters/story/{storyId}")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChaptersByStory(
            @PathVariable Long storyId) {
        List<ChapterResponse> data = chapterService.getChaptersByStoryId(storyId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/api/chapters/{id}")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapterById(
            @PathVariable Long id) {
        ChapterResponse data = chapterService.getChapterById(id);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ==================== ADMIN APIs ====================

    @PostMapping("/api/admin/chapters")
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(
            @Valid @RequestBody ChapterRequest request) {
        ChapterResponse data = chapterService.createChapter(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo chương thành công", data));
    }

    @PutMapping("/api/admin/chapters/{id}")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(
            @PathVariable Long id,
            @Valid @RequestBody ChapterRequest request) {
        ChapterResponse data = chapterService.updateChapter(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chương thành công", data));
    }

    @DeleteMapping("/api/admin/chapters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable Long id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa chương thành công", null));
    }
}

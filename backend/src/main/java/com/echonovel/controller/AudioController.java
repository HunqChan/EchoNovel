package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.response.AudioFileResponse;
import com.echonovel.service.AudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class AudioController {

    private final AudioService audioService;

    // ==================== PUBLIC / USER APIs ====================

    /**
     * GET /api/chapters/{chapterId}/audio
     * Get audio info for a chapter (checks access level).
     * Returns 404 if no audio exists yet (Frontend shows "Nghe bằng AI" button).
     */
    @GetMapping("/api/chapters/{chapterId}/audio")
    public ResponseEntity<ApiResponse<AudioFileResponse>> getAudio(@PathVariable Long chapterId) {
        Optional<AudioFileResponse> audio = audioService.getAudioByChapterId(chapterId);

        if (audio.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Chương này chưa có audio"));
        }

        return ResponseEntity.ok(ApiResponse.success(audio.get()));
    }

    /**
     * POST /api/chapters/{chapterId}/tts
     * Request TTS generation (checks access level, uses cache).
     */
    @PostMapping("/api/chapters/{chapterId}/tts")
    public ResponseEntity<ApiResponse<AudioFileResponse>> generateTts(
            @PathVariable Long chapterId,
            @RequestParam(required = false, defaultValue = "vi-VN-HoaiMyNeural") String voice) {
        AudioFileResponse data = audioService.generateTts(chapterId, voice);
        return ResponseEntity.ok(ApiResponse.success("Tạo audio thành công", data));
    }

    // ==================== ADMIN APIs ====================

    /**
     * POST /api/admin/chapters/{chapterId}/audio
     * Admin upload audio file for a chapter.
     */
    @PostMapping("/api/admin/chapters/{chapterId}/audio")
    public ResponseEntity<ApiResponse<AudioFileResponse>> uploadAudio(
            @PathVariable Long chapterId,
            @RequestPart("file") MultipartFile file) {
        AudioFileResponse data = audioService.uploadAudio(chapterId, file);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Upload audio thành công", data));
    }
}

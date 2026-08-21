package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.response.ReadingHistoryResponse;
import com.echonovel.dto.response.TrendingStoryResponse;
import com.echonovel.service.ReadingHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReadingHistoryController {

    private final ReadingHistoryService readingHistoryService;

    @GetMapping("/api/users/reading-history")
    public ResponseEntity<ApiResponse<List<ReadingHistoryResponse>>> getUserReadingHistory(
            Authentication authentication) {
        List<ReadingHistoryResponse> data = readingHistoryService.getUserReadingHistory(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/api/stories/trending")
    public ResponseEntity<ApiResponse<List<TrendingStoryResponse>>> getTrendingStories() {
        List<TrendingStoryResponse> data = readingHistoryService.getTrendingStories();
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}

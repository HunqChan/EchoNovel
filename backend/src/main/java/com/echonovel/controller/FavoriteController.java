package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.response.FavoriteResponse;
import com.echonovel.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/api/stories/{id}/favorite")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleFavorite(
            Authentication authentication,
            @PathVariable Long id) {
        boolean isFavorited = favoriteService.toggleFavorite(authentication.getName(), id);
        String message = isFavorited ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích";
        return ResponseEntity.ok(ApiResponse.success(message, Map.of("favorited", isFavorited)));
    }

    @GetMapping("/api/stories/{id}/favorite-status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getFavoriteStatus(
            Authentication authentication,
            @PathVariable Long id) {
        boolean isFavorited = favoriteService.isFavorited(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("favorited", isFavorited)));
    }

    @GetMapping("/api/users/favorites")
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getUserFavorites(
            Authentication authentication) {
        List<FavoriteResponse> data = favoriteService.getUserFavorites(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}

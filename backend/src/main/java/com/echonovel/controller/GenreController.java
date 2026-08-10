package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.request.GenreRequest;
import com.echonovel.dto.response.GenreResponse;
import com.echonovel.service.GenreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    // ==================== PUBLIC APIs ====================

    @GetMapping("/api/genres")
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getAllGenres() {
        List<GenreResponse> data = genreService.getAllGenres();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ==================== ADMIN APIs ====================

    @PostMapping("/api/admin/genres")
    public ResponseEntity<ApiResponse<GenreResponse>> createGenre(
            @Valid @RequestBody GenreRequest request) {
        GenreResponse data = genreService.createGenre(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo thể loại thành công", data));
    }

    @PutMapping("/api/admin/genres/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> updateGenre(
            @PathVariable Long id,
            @Valid @RequestBody GenreRequest request) {
        GenreResponse data = genreService.updateGenre(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thể loại thành công", data));
    }

    @DeleteMapping("/api/admin/genres/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thể loại thành công", null));
    }
}

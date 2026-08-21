package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.request.CommentRequest;
import com.echonovel.dto.request.ReactionRequest;
import com.echonovel.dto.response.CommentResponse;
import com.echonovel.dto.response.ReactionSummaryResponse;
import com.echonovel.service.CommentService;
import com.echonovel.service.ReactionService;
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

@RestController
@RequiredArgsConstructor
public class InteractionController {

    private final ReactionService reactionService;
    private final CommentService commentService;

    // ==================== Reaction APIs ====================

    @PostMapping("/api/stories/{id}/reaction")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> react(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ReactionRequest request) {
        ReactionSummaryResponse data = reactionService.react(authentication.getName(), id, request.getType());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/api/stories/{id}/reaction-summary")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> getReactionSummary(
            Authentication authentication,
            @PathVariable Long id) {
        String email = (authentication != null && authentication.isAuthenticated()
                && !authentication.getPrincipal().equals("anonymousUser"))
                ? authentication.getName() : null;
        ReactionSummaryResponse data = reactionService.getReactionSummary(id, email);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ==================== Comment APIs ====================

    @GetMapping("/api/stories/{id}/comments")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getComments(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        Page<CommentResponse> data = commentService.getComments(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/api/stories/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request) {
        CommentResponse data = commentService.addComment(authentication.getName(), id, request.getContent());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Bình luận thành công", data));
    }
}

package com.echonovel.service;

import com.echonovel.dto.response.CommentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for comment operations.
 */
public interface CommentService {

    /**
     * Add a comment to a story.
     */
    CommentResponse addComment(String email, Long storyId, String content);

    /**
     * Get paginated comments for a story.
     */
    Page<CommentResponse> getComments(Long storyId, Pageable pageable);
}

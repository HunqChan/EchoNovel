package com.echonovel.mapper;

import com.echonovel.dto.response.CommentResponse;
import com.echonovel.entity.Comment;
import org.springframework.stereotype.Component;

/**
 * Mapper for Comment entity → DTO conversions.
 */
@Component
public class CommentMapper {

    /**
     * Convert Comment entity → CommentResponse DTO.
     */
    public CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .username(comment.getUser().getUsername())
                .avatarUrl(comment.getUser().getAvatarUrl())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}

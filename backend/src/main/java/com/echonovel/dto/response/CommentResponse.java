package com.echonovel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private String username;
    private String avatarUrl;
    private String content;
    private LocalDateTime createdAt;
}

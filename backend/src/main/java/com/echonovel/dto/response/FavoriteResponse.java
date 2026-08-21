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
public class FavoriteResponse {
    private Long storyId;
    private String storyTitle;
    private String coverImage;
    private String authorName;
    private LocalDateTime createdAt;
}

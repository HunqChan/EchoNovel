package com.echonovel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryResponse {

    private Long id;
    private String title;
    private String authorName;
    private Long authorId;
    private Set<String> genres;
    private String coverImage;
    private String description;
    private String status;
    private Long priceCoins;
    private Boolean isPurchased;
    private java.util.List<ChapterResponse> chapters;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

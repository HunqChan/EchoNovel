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
public class ChapterResponse {

    private Long id;
    private Long storyId;
    private String storyTitle;
    private String title;
    private String content;
    private Integer chapterNumber;
    private String accessLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

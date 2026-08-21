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
public class ReadingHistoryResponse {
    private Long storyId;
    private String storyTitle;
    private String coverImage;
    private Long lastChapterId;
    private String lastChapterTitle;
    private Integer lastChapterNumber;
    private Integer progressPercent;
    private LocalDateTime updatedAt;
}

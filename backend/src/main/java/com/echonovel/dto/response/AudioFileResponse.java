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
public class AudioFileResponse {

    private Long id;
    private Long chapterId;
    private String chapterTitle;
    private String filePath;
    private String audioUrl;
    private String source;
    private Integer duration;
    private LocalDateTime createdAt;
}

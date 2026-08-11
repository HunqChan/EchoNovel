package com.echonovel.dto.response;

import com.echonovel.entity.AudioFile;
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

    public static AudioFileResponse fromEntity(AudioFile audioFile, String baseUrl) {
        return AudioFileResponse.builder()
                .id(audioFile.getId())
                .chapterId(audioFile.getChapter().getId())
                .chapterTitle(audioFile.getChapter().getTitle())
                .filePath(audioFile.getFilePath())
                .audioUrl(baseUrl + "/" + audioFile.getFilePath())
                .source(audioFile.getSource().name())
                .duration(audioFile.getDuration())
                .createdAt(audioFile.getCreatedAt())
                .build();
    }
}

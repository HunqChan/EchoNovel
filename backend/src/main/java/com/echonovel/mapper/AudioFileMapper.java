package com.echonovel.mapper;

import com.echonovel.dto.response.AudioFileResponse;
import com.echonovel.entity.AudioFile;
import org.springframework.stereotype.Component;

/**
 * Mapper for AudioFile entity → DTO conversions.
 */
@Component
public class AudioFileMapper {

    /**
     * Convert AudioFile entity → AudioFileResponse DTO.
     * Requires baseUrl to construct the full audio URL.
     */
    public AudioFileResponse toResponse(AudioFile audioFile, String baseUrl) {
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

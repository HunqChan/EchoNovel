package com.echonovel.mapper;

import com.echonovel.dto.request.ChapterRequest;
import com.echonovel.dto.response.ChapterResponse;
import com.echonovel.entity.Chapter;
import com.echonovel.entity.Story;
import com.echonovel.enums.AccessLevel;
import org.springframework.stereotype.Component;

/**
 * Mapper for Chapter entity ↔ DTO conversions.
 */
@Component
public class ChapterMapper {

    /**
     * Convert ChapterRequest → Chapter entity.
     * Requires pre-resolved Story entity.
     */
    public Chapter toEntity(ChapterRequest request, Story story) {
        return Chapter.builder()
                .story(story)
                .title(request.getTitle())
                .content(request.getContent())
                .chapterNumber(request.getChapterNumber())
                .accessLevel(request.getAccessLevel() != null
                        ? AccessLevel.valueOf(request.getAccessLevel())
                        : AccessLevel.PUBLIC)
                .build();
    }

    /**
     * Convert Chapter entity → ChapterResponse DTO (full response including content).
     */
    public ChapterResponse toResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .storyId(chapter.getStory().getId())
                .storyTitle(chapter.getStory().getTitle())
                .title(chapter.getTitle())
                .content(chapter.getContent())
                .chapterNumber(chapter.getChapterNumber())
                .accessLevel(chapter.getAccessLevel().name())
                .createdAt(chapter.getCreatedAt())
                .updatedAt(chapter.getUpdatedAt())
                .build();
    }

    /**
     * Convert Chapter entity → ChapterResponse DTO (summary without content, for listing).
     */
    public ChapterResponse toSummary(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .storyId(chapter.getStory().getId())
                .title(chapter.getTitle())
                .chapterNumber(chapter.getChapterNumber())
                .accessLevel(chapter.getAccessLevel().name())
                .createdAt(chapter.getCreatedAt())
                .build();
    }
}

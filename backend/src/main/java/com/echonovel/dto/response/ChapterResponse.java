package com.echonovel.dto.response;

import com.echonovel.entity.Chapter;
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

    /**
     * Full response including content (for reading)
     */
    public static ChapterResponse fromEntity(Chapter chapter) {
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
     * Summary response without content (for chapter listing)
     */
    public static ChapterResponse summaryFromEntity(Chapter chapter) {
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

package com.echonovel.dto.response;

import com.echonovel.entity.Story;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

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
    private java.util.List<ChapterResponse> chapters;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StoryResponse fromEntity(Story story) {
        return StoryResponse.builder()
                .id(story.getId())
                .title(story.getTitle())
                .authorName(story.getAuthor().getName())
                .authorId(story.getAuthor().getId())
                .genres(story.getGenres().stream()
                        .map(genre -> genre.getName())
                        .collect(Collectors.toSet()))
                .coverImage(story.getCoverImage())
                .description(story.getDescription())
                .status(story.getStatus().name())
                .createdAt(story.getCreatedAt())
                .updatedAt(story.getUpdatedAt())
                .build();
    }
}

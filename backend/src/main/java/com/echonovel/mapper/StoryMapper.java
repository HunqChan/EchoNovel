package com.echonovel.mapper;

import com.echonovel.dto.request.StoryRequest;
import com.echonovel.dto.response.StoryResponse;
import com.echonovel.entity.Author;
import com.echonovel.entity.Genre;
import com.echonovel.entity.Story;
import com.echonovel.enums.StoryStatus;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper for Story entity ↔ DTO conversions.
 */
@Component
public class StoryMapper {

    /**
     * Convert StoryRequest → Story entity.
     * Requires pre-resolved Author and Genre entities.
     */
    public Story toEntity(StoryRequest request, Author author, Set<Genre> genres) {
        return Story.builder()
                .title(request.getTitle())
                .author(author)
                .genres(genres)
                .coverImage(request.getCoverImage())
                .description(request.getDescription())
                .status(request.getStatus() != null
                        ? StoryStatus.valueOf(request.getStatus())
                        : StoryStatus.ONGOING)
                .build();
    }

    /**
     * Convert Story entity → StoryResponse DTO.
     */
    public StoryResponse toResponse(Story story) {
        return StoryResponse.builder()
                .id(story.getId())
                .title(story.getTitle())
                .authorName(story.getAuthor().getName())
                .authorId(story.getAuthor().getId())
                .genres(story.getGenres().stream()
                        .map(Genre::getName)
                        .collect(Collectors.toSet()))
                .coverImage(story.getCoverImage())
                .description(story.getDescription())
                .status(story.getStatus().name())
                .createdAt(story.getCreatedAt())
                .updatedAt(story.getUpdatedAt())
                .build();
    }
}

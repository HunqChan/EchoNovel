package com.echonovel.mapper;

import com.echonovel.dto.request.GenreRequest;
import com.echonovel.dto.response.GenreResponse;
import com.echonovel.entity.Genre;
import org.springframework.stereotype.Component;

/**
 * Mapper for Genre entity ↔ DTO conversions.
 */
@Component
public class GenreMapper {

    /**
     * Convert GenreRequest → Genre entity.
     */
    public Genre toEntity(GenreRequest request) {
        return Genre.builder()
                .name(request.getName())
                .build();
    }

    /**
     * Convert Genre entity → GenreResponse DTO.
     */
    public GenreResponse toResponse(Genre genre) {
        return GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build();
    }
}

package com.echonovel.mapper;

import com.echonovel.dto.request.AuthorRequest;
import com.echonovel.dto.response.AuthorResponse;
import com.echonovel.entity.Author;
import org.springframework.stereotype.Component;

/**
 * Mapper for Author entity ↔ DTO conversions.
 */
@Component
public class AuthorMapper {

    /**
     * Convert AuthorRequest → Author entity.
     */
    public Author toEntity(AuthorRequest request) {
        return Author.builder()
                .name(request.getName())
                .bio(request.getBio())
                .build();
    }

    /**
     * Convert Author entity → AuthorResponse DTO.
     */
    public AuthorResponse toResponse(Author author) {
        return AuthorResponse.builder()
                .id(author.getId())
                .name(author.getName())
                .bio(author.getBio())
                .build();
    }
}

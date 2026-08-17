package com.echonovel.service;

import com.echonovel.dto.request.GenreRequest;
import com.echonovel.dto.response.GenreResponse;

import java.util.List;

/**
 * Service interface for genre operations.
 */
public interface GenreService {

    /**
     * Get all genres.
     */
    List<GenreResponse> getAllGenres();

    /**
     * Create a new genre (Admin).
     */
    GenreResponse createGenre(GenreRequest request);

    /**
     * Update a genre (Admin).
     */
    GenreResponse updateGenre(Long id, GenreRequest request);

    /**
     * Delete a genre (Admin).
     */
    void deleteGenre(Long id);
}

package com.echonovel.service;

import com.echonovel.dto.request.AuthorRequest;
import com.echonovel.dto.response.AuthorResponse;

import java.util.List;

/**
 * Service interface for author operations.
 */
public interface AuthorService {

    /**
     * Get all authors.
     */
    List<AuthorResponse> getAllAuthors();

    /**
     * Create a new author (Admin).
     */
    AuthorResponse createAuthor(AuthorRequest request);

    /**
     * Update an author (Admin).
     */
    AuthorResponse updateAuthor(Long id, AuthorRequest request);

    /**
     * Delete an author (Admin).
     */
    void deleteAuthor(Long id);
}

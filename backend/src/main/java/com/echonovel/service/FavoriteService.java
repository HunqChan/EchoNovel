package com.echonovel.service;

import com.echonovel.dto.response.FavoriteResponse;

import java.util.List;

/**
 * Service interface for favorite (bookmark) operations.
 */
public interface FavoriteService {

    /**
     * Toggle favorite status. Returns true if favorited, false if unfavorited.
     */
    boolean toggleFavorite(String email, Long storyId);

    /**
     * Check if current user has favorited a story.
     */
    boolean isFavorited(String email, Long storyId);

    /**
     * Get all favorite stories for a user.
     */
    List<FavoriteResponse> getUserFavorites(String email);
}

package com.echonovel.service;

import com.echonovel.dto.request.StoryRequest;
import com.echonovel.dto.response.StoryResponse;
import com.echonovel.enums.StoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for story operations.
 */
public interface StoryService {

    /**
     * Get all stories with filtering and pagination.
     */
    Page<StoryResponse> getStories(String keyword, List<Long> genreIds, StoryStatus status, Pageable pageable);

    /**
     * Get story by ID (includes chapters).
     */
    StoryResponse getStoryById(Long id);

    /**
     * Create a new story (Admin).
     */
    StoryResponse createStory(StoryRequest request);

    /**
     * Update a story (Admin).
     */
    StoryResponse updateStory(Long id, StoryRequest request);

    /**
     * Delete a story (Admin).
     */
    void deleteStory(Long id);

    /**
     * Upload and update story cover image via Cloudinary.
     */
    StoryResponse updateCoverImage(Long storyId, MultipartFile file);

    /**
     * Get recommended stories with same genres (exclude current story).
     */
    List<StoryResponse> getRecommendations(Long storyId);
}

package com.echonovel.service;

import com.echonovel.dto.request.ChapterRequest;
import com.echonovel.dto.response.ChapterResponse;

import java.util.List;

/**
 * Service interface for chapter operations.
 */
public interface ChapterService {

    /**
     * Get all chapters of a story (summary list, no content).
     */
    List<ChapterResponse> getChaptersByStoryId(Long storyId);

    /**
     * Get a single chapter with full content (for admin or reading after access check).
     */
    ChapterResponse getChapterById(Long id);

    /**
     * Create a new chapter (Admin).
     */
    ChapterResponse createChapter(ChapterRequest request);

    /**
     * Update a chapter (Admin).
     */
    ChapterResponse updateChapter(Long id, ChapterRequest request);

    /**
     * Delete a chapter (Admin).
     */
    void deleteChapter(Long id);
}

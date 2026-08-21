package com.echonovel.service;

import com.echonovel.dto.response.ReadingHistoryResponse;
import com.echonovel.dto.response.TrendingStoryResponse;

import java.util.List;

/**
 * Service interface for reading history and trending stories.
 */
public interface ReadingHistoryService {

    /**
     * Record or update reading progress when a user reads a chapter.
     */
    void recordReading(String email, Long chapterId);

    /**
     * Get all reading history for a user (stories being read).
     */
    List<ReadingHistoryResponse> getUserReadingHistory(String email);

    /**
     * Get trending stories based on reader count.
     */
    List<TrendingStoryResponse> getTrendingStories();
}

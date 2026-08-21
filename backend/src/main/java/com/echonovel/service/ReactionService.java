package com.echonovel.service;

import com.echonovel.dto.response.ReactionSummaryResponse;

/**
 * Service interface for story reaction (Like/Dislike) operations.
 */
public interface ReactionService {

    /**
     * Submit or toggle a reaction. Returns the current reaction summary.
     */
    ReactionSummaryResponse react(String email, Long storyId, String type);

    /**
     * Get reaction summary for a story, optionally including user's reaction.
     */
    ReactionSummaryResponse getReactionSummary(Long storyId, String email);
}

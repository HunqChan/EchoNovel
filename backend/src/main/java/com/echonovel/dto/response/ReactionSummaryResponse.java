package com.echonovel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionSummaryResponse {
    private long totalLikes;
    private long totalDislikes;
    private String userReaction; // "LIKE", "DISLIKE", or null
}

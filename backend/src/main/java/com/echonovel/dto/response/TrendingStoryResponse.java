package com.echonovel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendingStoryResponse {
    private Long storyId;
    private String title;
    private String coverImage;
    private String authorName;
    private long readerCount;
    private Set<String> genres;
}

package com.echonovel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalStories;
    private long totalChapters;
    private long totalUsers;
    private long totalVipUsers;
    
    // e.g. {"PUBLIC": 100, "MEMBER": 50, "VIP": 20}
    private Map<String, Long> accessLevelDistribution;
    
    // e.g. [{"title": "Tiên Nghịch", "count": 100}, {"title": "Phàm Nhân", "count": 50}]
    private List<TopStoryStat> topStories;

    @Data
    @AllArgsConstructor
    public static class TopStoryStat {
        private String title;
        private long chapterCount;
    }
}

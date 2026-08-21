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

    // ========== New fields ==========
    
    private List<DailyStatPoint> userGrowth;       // New user registrations per day (last 30 days)
    private List<DailyStatPoint> revenueStats;     // Coin revenue per day
    private long totalVipPackagesSold;             // Total VIP packages sold
    private List<TopStoryStat> topReadStories;     // Top stories by reader count
    private List<TopStoryStat> topLikedStories;    // Top stories by like count
    private Map<String, Long> genreDistribution;   // Genre distribution

    @Data
    @AllArgsConstructor
    public static class TopStoryStat {
        private String title;
        private long chapterCount;
    }

    @Data
    @AllArgsConstructor
    public static class DailyStatPoint {
        private String date;
        private long value;
    }
}

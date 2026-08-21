package com.echonovel.service.impl;

import com.echonovel.dto.response.AdminStatsResponse;
import com.echonovel.entity.Genre;
import com.echonovel.entity.Story;
import com.echonovel.enums.AccessLevel;
import com.echonovel.enums.TransactionType;
import com.echonovel.repository.*;
import com.echonovel.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;
    private final CoinTransactionRepository coinTransactionRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final StoryReactionRepository storyReactionRepository;
    private final GenreRepository genreRepository;

    @Override
    public AdminStatsResponse getAdminStats() {
        long totalStories = storyRepository.count();
        long totalChapters = chapterRepository.count();
        long totalUsers = userRepository.count();
        long totalVipUsers = userRepository.countByVipTypeNot(com.echonovel.enums.VipType.NONE);

        // Process Access Level Distribution
        List<Object[]> accessLevelCounts = chapterRepository.countChaptersByAccessLevel();
        Map<String, Long> accessLevelDistribution = new HashMap<>();
        // Initialize with 0s
        accessLevelDistribution.put("PUBLIC", 0L);
        accessLevelDistribution.put("MEMBER", 0L);
        accessLevelDistribution.put("VIP", 0L);

        for (Object[] row : accessLevelCounts) {
            AccessLevel level = (AccessLevel) row[0];
            Long count = (Long) row[1];
            if (level != null) {
                accessLevelDistribution.put(level.name(), count);
            }
        }

        // Process Top Stories by Chapter Count (Top 5)
        List<Object[]> topStoriesData = storyRepository.findTopStoriesByChapterCount(PageRequest.of(0, 5));
        List<AdminStatsResponse.TopStoryStat> topStories = topStoriesData.stream()
                .map(row -> new AdminStatsResponse.TopStoryStat((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());

        // ========== New metrics ==========

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // User growth (last 30 days)
        List<Object[]> userGrowthData = userRepository.countNewUsersByDay(thirtyDaysAgo);
        List<AdminStatsResponse.DailyStatPoint> userGrowth = userGrowthData.stream()
                .map(row -> new AdminStatsResponse.DailyStatPoint(row[0].toString(), (Long) row[1]))
                .collect(Collectors.toList());

        // Revenue stats (last 30 days)
        List<Object[]> revenueData = coinTransactionRepository.sumRevenueByDay(thirtyDaysAgo);
        List<AdminStatsResponse.DailyStatPoint> revenueStats = revenueData.stream()
                .map(row -> new AdminStatsResponse.DailyStatPoint(row[0].toString(), ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        // Total VIP packages sold
        long totalVipPackagesSold = coinTransactionRepository.countByType(TransactionType.BUY_VIP);

        // Top 5 stories by reader count
        List<Object[]> topReadData = readingHistoryRepository.findTrendingStoryIds(PageRequest.of(0, 5));
        List<AdminStatsResponse.TopStoryStat> topReadStories = topReadData.stream()
                .map(row -> {
                    Long storyId = (Long) row[0];
                    long readerCount = (Long) row[1];
                    String title = storyRepository.findById(storyId)
                            .map(Story::getTitle).orElse("Unknown");
                    return new AdminStatsResponse.TopStoryStat(title, readerCount);
                })
                .collect(Collectors.toList());

        // Top 5 stories by like count
        List<Object[]> topLikedData = storyReactionRepository.findTopLikedStories(PageRequest.of(0, 5));
        List<AdminStatsResponse.TopStoryStat> topLikedStories = topLikedData.stream()
                .map(row -> {
                    Long storyId = (Long) row[0];
                    long likeCount = (Long) row[1];
                    String title = storyRepository.findById(storyId)
                            .map(Story::getTitle).orElse("Unknown");
                    return new AdminStatsResponse.TopStoryStat(title, likeCount);
                })
                .collect(Collectors.toList());

        // Genre distribution
        Map<String, Long> genreDistribution = new LinkedHashMap<>();
        List<Story> allStories = storyRepository.findAll();
        for (Story story : allStories) {
            for (Genre genre : story.getGenres()) {
                genreDistribution.merge(genre.getName(), 1L, Long::sum);
            }
        }

        return AdminStatsResponse.builder()
                .totalStories(totalStories)
                .totalChapters(totalChapters)
                .totalUsers(totalUsers)
                .totalVipUsers(totalVipUsers)
                .accessLevelDistribution(accessLevelDistribution)
                .topStories(topStories)
                .userGrowth(userGrowth)
                .revenueStats(revenueStats)
                .totalVipPackagesSold(totalVipPackagesSold)
                .topReadStories(topReadStories)
                .topLikedStories(topLikedStories)
                .genreDistribution(genreDistribution)
                .build();
    }
}

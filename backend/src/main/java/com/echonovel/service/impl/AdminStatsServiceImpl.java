package com.echonovel.service.impl;

import com.echonovel.dto.response.AdminStatsResponse;
import com.echonovel.enums.AccessLevel;
import com.echonovel.repository.ChapterRepository;
import com.echonovel.repository.StoryRepository;
import com.echonovel.repository.UserRepository;
import com.echonovel.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;

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

        return AdminStatsResponse.builder()
                .totalStories(totalStories)
                .totalChapters(totalChapters)
                .totalUsers(totalUsers)
                .totalVipUsers(totalVipUsers)
                .accessLevelDistribution(accessLevelDistribution)
                .topStories(topStories)
                .build();
    }
}

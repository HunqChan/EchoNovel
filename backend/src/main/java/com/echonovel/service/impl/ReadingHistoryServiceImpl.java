package com.echonovel.service.impl;

import com.echonovel.dto.response.ReadingHistoryResponse;
import com.echonovel.dto.response.TrendingStoryResponse;
import com.echonovel.entity.Chapter;
import com.echonovel.entity.Genre;
import com.echonovel.entity.ReadingHistory;
import com.echonovel.entity.Story;
import com.echonovel.entity.User;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.ChapterRepository;
import com.echonovel.repository.ReadingHistoryRepository;
import com.echonovel.repository.StoryRepository;
import com.echonovel.repository.UserRepository;
import com.echonovel.service.ReadingHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadingHistoryServiceImpl implements ReadingHistoryService {

    private final ReadingHistoryRepository readingHistoryRepository;
    private final UserRepository userRepository;
    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;

    @Override
    @Transactional
    public void recordReading(String email, Long chapterId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        Story story = chapter.getStory();
        List<Chapter> allChapters = chapterRepository.findByStoryIdOrderByChapterNumberAsc(story.getId());
        int totalChapters = allChapters.size();
        int progressPercent = totalChapters > 0 ? (chapter.getChapterNumber() * 100 / totalChapters) : 0;

        Optional<ReadingHistory> existing = readingHistoryRepository.findByUserIdAndStoryId(user.getId(), story.getId());
        if (existing.isPresent()) {
            ReadingHistory history = existing.get();
            history.setLastChapter(chapter);
            history.setProgressPercent(progressPercent);
            readingHistoryRepository.save(history);
        } else {
            ReadingHistory history = ReadingHistory.builder()
                    .user(user)
                    .story(story)
                    .lastChapter(chapter)
                    .progressPercent(progressPercent)
                    .build();
            readingHistoryRepository.save(history);
        }
        log.debug("Reading history recorded for user {} on chapter {}", email, chapterId);
    }

    @Override
    public List<ReadingHistoryResponse> getUserReadingHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return readingHistoryRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(rh -> ReadingHistoryResponse.builder()
                        .storyId(rh.getStory().getId())
                        .storyTitle(rh.getStory().getTitle())
                        .coverImage(rh.getStory().getCoverImage())
                        .lastChapterId(rh.getLastChapter() != null ? rh.getLastChapter().getId() : null)
                        .lastChapterTitle(rh.getLastChapter() != null ? rh.getLastChapter().getTitle() : null)
                        .lastChapterNumber(rh.getLastChapter() != null ? rh.getLastChapter().getChapterNumber() : null)
                        .progressPercent(rh.getProgressPercent())
                        .updatedAt(rh.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<TrendingStoryResponse> getTrendingStories() {
        List<Object[]> trendingData = readingHistoryRepository.findTrendingStoryIds(PageRequest.of(0, 10));
        List<TrendingStoryResponse> result = new ArrayList<>();

        for (Object[] row : trendingData) {
            Long storyId = (Long) row[0];
            long readerCount = (Long) row[1];

            storyRepository.findById(storyId).ifPresent(story -> {
                result.add(TrendingStoryResponse.builder()
                        .storyId(story.getId())
                        .title(story.getTitle())
                        .coverImage(story.getCoverImage())
                        .authorName(story.getAuthor().getName())
                        .readerCount(readerCount)
                        .genres(story.getGenres().stream().map(Genre::getName).collect(Collectors.toSet()))
                        .build());
            });
        }

        return result;
    }
}

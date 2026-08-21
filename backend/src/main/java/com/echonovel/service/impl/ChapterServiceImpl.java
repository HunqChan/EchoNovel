package com.echonovel.service.impl;

import com.echonovel.dto.request.ChapterRequest;
import com.echonovel.dto.response.ChapterResponse;
import com.echonovel.entity.Chapter;
import com.echonovel.entity.Story;
import com.echonovel.entity.User;
import com.echonovel.enums.AccessLevel;
import com.echonovel.enums.Role;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.mapper.ChapterMapper;
import com.echonovel.repository.ChapterRepository;
import com.echonovel.repository.StoryRepository;
import com.echonovel.repository.UserRepository;
import com.echonovel.repository.UserPurchasedStoryRepository;
import com.echonovel.service.ChapterService;
import com.echonovel.service.ReadingHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final UserPurchasedStoryRepository userPurchasedStoryRepository;
    private final ChapterMapper chapterMapper;
    private final ReadingHistoryService readingHistoryService;

    /**
     * Get all chapters of a story (summary list, no content)
     */
    @Override
    public List<ChapterResponse> getChaptersByStoryId(Long storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new AppException(ErrorCode.STORY_NOT_FOUND);
        }
        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId)
                .stream()
                .map(chapterMapper::toSummary)
                .collect(Collectors.toList());
    }

    /**
     * Get a single chapter with full content (for admin or reading after access check)
     */
    @Override
    public ChapterResponse getChapterById(Long id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        if (chapter.getAccessLevel() != AccessLevel.PUBLIC) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            if (chapter.getAccessLevel() == AccessLevel.VIP) {
                if (user.getRole() == Role.ADMIN) {
                    return chapterMapper.toResponse(chapter);
                }
                
                boolean hasVip = user.getVipType() == com.echonovel.enums.VipType.PERMANENT || 
                                (user.getVipType() == com.echonovel.enums.VipType.SUBSCRIPTION && 
                                 user.getVipExpireAt() != null && 
                                 user.getVipExpireAt().isAfter(LocalDateTime.now()));

                if (!hasVip) {
                    boolean hasPurchased = userPurchasedStoryRepository.existsByUserIdAndStoryId(user.getId(), chapter.getStory().getId());
                    if (!hasPurchased) {
                        throw new AppException(ErrorCode.CHAPTER_ACCESS_DENIED);
                    }
                }
            }
        }

        // Record reading history for authenticated users
        recordReadingIfAuthenticated(chapter);

        return chapterMapper.toResponse(chapter);
    }

    /**
     * Create a new chapter (Admin)
     */
    @Override
    @Transactional
    public ChapterResponse createChapter(ChapterRequest request) {
        Story story = storyRepository.findById(request.getStoryId())
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        if (chapterRepository.existsByStoryIdAndChapterNumber(
                request.getStoryId(), request.getChapterNumber())) {
            throw new AppException(ErrorCode.CHAPTER_NUMBER_EXISTS);
        }

        Chapter chapter = chapterMapper.toEntity(request, story);
        chapter = chapterRepository.save(chapter);
        log.info("Chapter created: {} - Chương {} (ID: {})",
                story.getTitle(), chapter.getChapterNumber(), chapter.getId());
        return chapterMapper.toResponse(chapter);
    }

    /**
     * Update a chapter (Admin)
     */
    @Override
    @Transactional
    public ChapterResponse updateChapter(Long id, ChapterRequest request) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        // Check if chapter number conflicts with another chapter in same story
        if (!chapter.getChapterNumber().equals(request.getChapterNumber()) &&
                chapterRepository.existsByStoryIdAndChapterNumber(
                        chapter.getStory().getId(), request.getChapterNumber())) {
            throw new AppException(ErrorCode.CHAPTER_NUMBER_EXISTS);
        }

        chapter.setTitle(request.getTitle());
        chapter.setContent(request.getContent());
        chapter.setChapterNumber(request.getChapterNumber());

        if (request.getAccessLevel() != null) {
            chapter.setAccessLevel(AccessLevel.valueOf(request.getAccessLevel()));
        }

        chapter = chapterRepository.save(chapter);
        log.info("Chapter updated: ID {}", chapter.getId());
        return chapterMapper.toResponse(chapter);
    }

    /**
     * Delete a chapter (Admin)
     */
    @Override
    @Transactional
    public void deleteChapter(Long id) {
        if (!chapterRepository.existsById(id)) {
            throw new AppException(ErrorCode.CHAPTER_NOT_FOUND);
        }
        chapterRepository.deleteById(id);
        log.info("Chapter deleted: ID {}", id);
    }

    /**
     * Record reading history if user is authenticated.
     */
    private void recordReadingIfAuthenticated(Chapter chapter) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                readingHistoryService.recordReading(auth.getName(), chapter.getId());
            }
        } catch (Exception e) {
            log.warn("Failed to record reading history for chapter {}: {}", chapter.getId(), e.getMessage());
        }
    }
}

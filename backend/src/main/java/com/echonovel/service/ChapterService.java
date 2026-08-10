package com.echonovel.service;

import com.echonovel.dto.request.ChapterRequest;
import com.echonovel.dto.response.ChapterResponse;
import com.echonovel.entity.Chapter;
import com.echonovel.entity.Story;
import com.echonovel.enums.AccessLevel;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.ChapterRepository;
import com.echonovel.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final StoryRepository storyRepository;
    private final com.echonovel.repository.UserRepository userRepository;

    /**
     * Get all chapters of a story (summary list, no content)
     */
    public List<ChapterResponse> getChaptersByStoryId(Long storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new AppException(ErrorCode.STORY_NOT_FOUND);
        }
        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId)
                .stream()
                .map(ChapterResponse::summaryFromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a single chapter with full content (for admin or reading after access check)
     */
    public ChapterResponse getChapterById(Long id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        if (chapter.getAccessLevel() != AccessLevel.PUBLIC) {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            String email = auth.getName();
            com.echonovel.entity.User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            if (chapter.getAccessLevel() == AccessLevel.VIP) {
                if (!Boolean.TRUE.equals(user.getIsVip()) && user.getRole() != com.echonovel.enums.Role.ADMIN) {
                    throw new AppException(ErrorCode.CHAPTER_ACCESS_DENIED);
                }
            }
        }

        return ChapterResponse.fromEntity(chapter);
    }

    /**
     * Create a new chapter (Admin)
     */
    @Transactional
    public ChapterResponse createChapter(ChapterRequest request) {
        Story story = storyRepository.findById(request.getStoryId())
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        if (chapterRepository.existsByStoryIdAndChapterNumber(
                request.getStoryId(), request.getChapterNumber())) {
            throw new AppException(ErrorCode.CHAPTER_NUMBER_EXISTS);
        }

        Chapter chapter = Chapter.builder()
                .story(story)
                .title(request.getTitle())
                .content(request.getContent())
                .chapterNumber(request.getChapterNumber())
                .accessLevel(request.getAccessLevel() != null
                        ? AccessLevel.valueOf(request.getAccessLevel())
                        : AccessLevel.PUBLIC)
                .build();

        chapter = chapterRepository.save(chapter);
        log.info("Chapter created: {} - Chương {} (ID: {})",
                story.getTitle(), chapter.getChapterNumber(), chapter.getId());
        return ChapterResponse.fromEntity(chapter);
    }

    /**
     * Update a chapter (Admin)
     */
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
        return ChapterResponse.fromEntity(chapter);
    }

    /**
     * Delete a chapter (Admin)
     */
    @Transactional
    public void deleteChapter(Long id) {
        if (!chapterRepository.existsById(id)) {
            throw new AppException(ErrorCode.CHAPTER_NOT_FOUND);
        }
        chapterRepository.deleteById(id);
        log.info("Chapter deleted: ID {}", id);
    }
}

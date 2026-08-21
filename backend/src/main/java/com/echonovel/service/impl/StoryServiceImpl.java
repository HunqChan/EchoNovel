package com.echonovel.service.impl;

import com.echonovel.dto.request.StoryRequest;
import com.echonovel.dto.response.StoryResponse;
import com.echonovel.entity.Author;
import com.echonovel.entity.Genre;
import com.echonovel.entity.Story;
import com.echonovel.enums.StoryStatus;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.mapper.ChapterMapper;
import com.echonovel.mapper.StoryMapper;
import com.echonovel.repository.AuthorRepository;
import com.echonovel.repository.ChapterRepository;
import com.echonovel.repository.GenreRepository;
import com.echonovel.repository.StoryRepository;
import com.echonovel.repository.UserRepository;
import com.echonovel.repository.UserPurchasedStoryRepository;
import com.echonovel.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;
    private final UserPurchasedStoryRepository userPurchasedStoryRepository;
    private final StoryMapper storyMapper;
    private final ChapterMapper chapterMapper;

    /**
     * Get all stories with filtering and pagination
     */
    @Override
    public Page<StoryResponse> getStories(String keyword, List<Long> genreIds, StoryStatus status, Pageable pageable) {
        boolean hasGenreIds = genreIds != null && !genreIds.isEmpty();
        List<Long> safeGenreIds = hasGenreIds ? genreIds : Collections.singletonList(-1L);
        return storyRepository.findFilteredStories(keyword, hasGenreIds, safeGenreIds, status, pageable)
                .map(storyMapper::toResponse);
    }

    /**
     * Get story by ID (includes chapters)
     */
    @Override
    public StoryResponse getStoryById(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        StoryResponse response = storyMapper.toResponse(story);
        response.setChapters(chapterRepository.findByStoryIdOrderByChapterNumberAsc(id)
                .stream()
                .map(chapterMapper::toSummary)
                .collect(Collectors.toList()));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String email = auth.getName();
            userRepository.findByEmail(email).ifPresent(user -> {
                boolean purchased = userPurchasedStoryRepository.existsByUserIdAndStoryId(user.getId(), id);
                response.setIsPurchased(purchased);
            });
        } else {
            response.setIsPurchased(false);
        }

        return response;
    }

    /**
     * Create a new story (Admin)
     */
    @Override
    @Transactional
    public StoryResponse createStory(StoryRequest request) {
        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        Set<Genre> genres = resolveGenres(request.getGenreIds());

        Story story = storyMapper.toEntity(request, author, genres);
        story = storyRepository.save(story);
        log.info("Story created: {} (ID: {})", story.getTitle(), story.getId());
        return storyMapper.toResponse(story);
    }

    /**
     * Update a story (Admin)
     */
    @Override
    @Transactional
    public StoryResponse updateStory(Long id, StoryRequest request) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        story.setTitle(request.getTitle());
        story.setAuthor(author);
        story.setCoverImage(request.getCoverImage());
        story.setDescription(request.getDescription());
        if (request.getPriceCoins() != null) {
            story.setPriceCoins(request.getPriceCoins());
        }

        if (request.getStatus() != null) {
            story.setStatus(StoryStatus.valueOf(request.getStatus()));
        }

        if (request.getGenreIds() != null) {
            story.setGenres(resolveGenres(request.getGenreIds()));
        }

        story = storyRepository.save(story);
        log.info("Story updated: {} (ID: {})", story.getTitle(), story.getId());
        return storyMapper.toResponse(story);
    }

    /**
     * Delete a story (Admin)
     */
    @Override
    @Transactional
    public void deleteStory(Long id) {
        if (!storyRepository.existsById(id)) {
            throw new AppException(ErrorCode.STORY_NOT_FOUND);
        }
        storyRepository.deleteById(id);
        log.info("Story deleted: ID {}", id);
    }

    /**
     * Resolve genre IDs to Genre entities.
     */
    private Set<Genre> resolveGenres(Set<Long> genreIds) {
        Set<Genre> genres = new HashSet<>();
        if (genreIds != null && !genreIds.isEmpty()) {
            for (Long genreId : genreIds) {
                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_FOUND));
                genres.add(genre);
            }
        }
        return genres;
    }

    /**
     * Get recommended stories that share at least one genre with the given story.
     */
    @Override
    public List<StoryResponse> getRecommendations(Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        Set<Long> genreIds = story.getGenres().stream()
                .map(Genre::getId)
                .collect(Collectors.toSet());

        if (genreIds.isEmpty()) {
            return Collections.emptyList();
        }

        return storyRepository.findRecommendedStories(genreIds, storyId,
                        org.springframework.data.domain.PageRequest.of(0, 6))
                .getContent()
                .stream()
                .map(storyMapper::toResponse)
                .collect(Collectors.toList());
    }
}

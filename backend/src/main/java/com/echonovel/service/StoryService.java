package com.echonovel.service;

import com.echonovel.dto.request.StoryRequest;
import com.echonovel.dto.response.StoryResponse;
import com.echonovel.entity.Author;
import com.echonovel.entity.Genre;
import com.echonovel.entity.Story;
import com.echonovel.enums.StoryStatus;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.AuthorRepository;
import com.echonovel.repository.GenreRepository;
import com.echonovel.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final com.echonovel.repository.ChapterRepository chapterRepository;

    /**
     * Get all stories with filtering and pagination
     */
    public Page<StoryResponse> getStories(String keyword, Long genreId, StoryStatus status, Pageable pageable) {
        return storyRepository.findFilteredStories(keyword, genreId, status, pageable)
                .map(StoryResponse::fromEntity);
    }

    /**
     * Get story by ID (includes chapters)
     */
    public StoryResponse getStoryById(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));
        
        StoryResponse response = StoryResponse.fromEntity(story);
        response.setChapters(chapterRepository.findByStoryIdOrderByChapterNumberAsc(id)
                .stream()
                .map(com.echonovel.dto.response.ChapterResponse::summaryFromEntity)
                .collect(java.util.stream.Collectors.toList()));
        return response;
    }

    /**
     * Create a new story (Admin)
     */
    @Transactional
    public StoryResponse createStory(StoryRequest request) {
        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        Set<Genre> genres = new HashSet<>();
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            for (Long genreId : request.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_FOUND));
                genres.add(genre);
            }
        }

        Story story = Story.builder()
                .title(request.getTitle())
                .author(author)
                .genres(genres)
                .coverImage(request.getCoverImage())
                .description(request.getDescription())
                .status(request.getStatus() != null
                        ? StoryStatus.valueOf(request.getStatus())
                        : StoryStatus.ONGOING)
                .build();

        story = storyRepository.save(story);
        log.info("Story created: {} (ID: {})", story.getTitle(), story.getId());
        return StoryResponse.fromEntity(story);
    }

    /**
     * Update a story (Admin)
     */
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

        if (request.getStatus() != null) {
            story.setStatus(StoryStatus.valueOf(request.getStatus()));
        }

        if (request.getGenreIds() != null) {
            Set<Genre> genres = new HashSet<>();
            for (Long genreId : request.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_FOUND));
                genres.add(genre);
            }
            story.setGenres(genres);
        }

        story = storyRepository.save(story);
        log.info("Story updated: {} (ID: {})", story.getTitle(), story.getId());
        return StoryResponse.fromEntity(story);
    }

    /**
     * Delete a story (Admin)
     */
    @Transactional
    public void deleteStory(Long id) {
        if (!storyRepository.existsById(id)) {
            throw new AppException(ErrorCode.STORY_NOT_FOUND);
        }
        storyRepository.deleteById(id);
        log.info("Story deleted: ID {}", id);
    }
}

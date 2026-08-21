package com.echonovel.service.impl;

import com.echonovel.dto.response.FavoriteResponse;
import com.echonovel.entity.Favorite;
import com.echonovel.entity.Story;
import com.echonovel.entity.User;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.FavoriteRepository;
import com.echonovel.repository.StoryRepository;
import com.echonovel.repository.UserRepository;
import com.echonovel.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final StoryRepository storyRepository;

    @Override
    @Transactional
    public boolean toggleFavorite(String email, Long storyId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        Optional<Favorite> existing = favoriteRepository.findByUserIdAndStoryId(user.getId(), storyId);
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            log.info("User {} unfavorited story {}", email, storyId);
            return false;
        } else {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .story(story)
                    .build();
            favoriteRepository.save(favorite);
            log.info("User {} favorited story {}", email, storyId);
            return true;
        }
    }

    @Override
    public boolean isFavorited(String email, Long storyId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return favoriteRepository.existsByUserIdAndStoryId(user.getId(), storyId);
    }

    @Override
    public List<FavoriteResponse> getUserFavorites(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(fav -> FavoriteResponse.builder()
                        .storyId(fav.getStory().getId())
                        .storyTitle(fav.getStory().getTitle())
                        .coverImage(fav.getStory().getCoverImage())
                        .authorName(fav.getStory().getAuthor().getName())
                        .createdAt(fav.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}

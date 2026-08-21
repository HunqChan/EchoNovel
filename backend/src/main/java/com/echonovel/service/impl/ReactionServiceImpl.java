package com.echonovel.service.impl;

import com.echonovel.dto.response.ReactionSummaryResponse;
import com.echonovel.entity.StoryReaction;
import com.echonovel.entity.Story;
import com.echonovel.entity.User;
import com.echonovel.enums.ReactionType;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.StoryReactionRepository;
import com.echonovel.repository.StoryRepository;
import com.echonovel.repository.UserRepository;
import com.echonovel.service.ReactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReactionServiceImpl implements ReactionService {

    private final StoryReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final StoryRepository storyRepository;

    @Override
    @Transactional
    public ReactionSummaryResponse react(String email, Long storyId, String type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        ReactionType reactionType = ReactionType.valueOf(type.toUpperCase());

        Optional<StoryReaction> existing = reactionRepository.findByUserIdAndStoryId(user.getId(), storyId);
        if (existing.isPresent()) {
            StoryReaction reaction = existing.get();
            if (reaction.getType() == reactionType) {
                // Same type → toggle off (remove)
                reactionRepository.delete(reaction);
                log.info("User {} removed {} on story {}", email, type, storyId);
            } else {
                // Different type → switch
                reaction.setType(reactionType);
                reactionRepository.save(reaction);
                log.info("User {} switched to {} on story {}", email, type, storyId);
            }
        } else {
            // New reaction
            StoryReaction reaction = StoryReaction.builder()
                    .user(user)
                    .story(story)
                    .type(reactionType)
                    .build();
            reactionRepository.save(reaction);
            log.info("User {} reacted {} on story {}", email, type, storyId);
        }

        return getReactionSummary(storyId, email);
    }

    @Override
    public ReactionSummaryResponse getReactionSummary(Long storyId, String email) {
        long totalLikes = reactionRepository.countByStoryIdAndType(storyId, ReactionType.LIKE);
        long totalDislikes = reactionRepository.countByStoryIdAndType(storyId, ReactionType.DISLIKE);

        String userReaction = null;
        if (email != null) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                Optional<StoryReaction> reaction = reactionRepository.findByUserIdAndStoryId(userOpt.get().getId(), storyId);
                userReaction = reaction.map(r -> r.getType().name()).orElse(null);
            }
        }

        return ReactionSummaryResponse.builder()
                .totalLikes(totalLikes)
                .totalDislikes(totalDislikes)
                .userReaction(userReaction)
                .build();
    }
}

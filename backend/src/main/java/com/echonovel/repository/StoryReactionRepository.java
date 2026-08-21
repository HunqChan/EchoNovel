package com.echonovel.repository;

import com.echonovel.entity.StoryReaction;
import com.echonovel.enums.ReactionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoryReactionRepository extends JpaRepository<StoryReaction, Long> {

    Optional<StoryReaction> findByUserIdAndStoryId(Long userId, Long storyId);

    long countByStoryIdAndType(Long storyId, ReactionType type);

    @Query("SELECT r.story.id, COUNT(r) FROM StoryReaction r WHERE r.type = 'LIKE' GROUP BY r.story.id ORDER BY COUNT(r) DESC")
    List<Object[]> findTopLikedStories(Pageable pageable);
}

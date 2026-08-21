package com.echonovel.repository;

import com.echonovel.entity.ReadingHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Long> {

    Optional<ReadingHistory> findByUserIdAndStoryId(Long userId, Long storyId);

    List<ReadingHistory> findByUserIdOrderByUpdatedAtDesc(Long userId);

    /**
     * Trending stories: count distinct readers per story, ordered desc.
     * Returns [storyId, readerCount].
     */
    @Query("SELECT rh.story.id, COUNT(DISTINCT rh.user.id) FROM ReadingHistory rh GROUP BY rh.story.id ORDER BY COUNT(DISTINCT rh.user.id) DESC")
    List<Object[]> findTrendingStoryIds(Pageable pageable);
}

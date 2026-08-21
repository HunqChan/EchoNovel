package com.echonovel.repository;

import com.echonovel.entity.Story;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {

    @Query("SELECT DISTINCT s FROM Story s LEFT JOIN s.genres g " +
           "WHERE (:keyword IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:hasGenreIds = false OR g.id IN :genreIds) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<Story> findFilteredStories(@Param("keyword") String keyword,
                                    @Param("hasGenreIds") boolean hasGenreIds,
                                    @Param("genreIds") java.util.List<Long> genreIds,
                                    @Param("status") com.echonovel.enums.StoryStatus status,
                                    Pageable pageable);

    @Query("SELECT s.title, COUNT(c) FROM Story s LEFT JOIN Chapter c ON s.id = c.story.id GROUP BY s.id, s.title ORDER BY COUNT(c) DESC")
    java.util.List<Object[]> findTopStoriesByChapterCount(Pageable pageable);

    @Query("SELECT DISTINCT s FROM Story s JOIN s.genres g WHERE g.id IN :genreIds AND s.id <> :excludeId")
    Page<Story> findRecommendedStories(@Param("genreIds") java.util.Set<Long> genreIds,
                                       @Param("excludeId") Long excludeId,
                                       Pageable pageable);
}

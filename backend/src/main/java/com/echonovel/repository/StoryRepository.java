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
           "AND (:genreId IS NULL OR g.id = :genreId) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<Story> findFilteredStories(@Param("keyword") String keyword,
                                    @Param("genreId") Long genreId,
                                    @Param("status") com.echonovel.enums.StoryStatus status,
                                    Pageable pageable);
}

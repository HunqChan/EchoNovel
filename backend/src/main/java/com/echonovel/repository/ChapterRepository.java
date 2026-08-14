package com.echonovel.repository;

import com.echonovel.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByStoryIdOrderByChapterNumberAsc(Long storyId);

    Optional<Chapter> findByStoryIdAndChapterNumber(Long storyId, Integer chapterNumber);

    boolean existsByStoryIdAndChapterNumber(Long storyId, Integer chapterNumber);

    @org.springframework.data.jpa.repository.Query("SELECT c.accessLevel, COUNT(c) FROM Chapter c GROUP BY c.accessLevel")
    List<Object[]> countChaptersByAccessLevel();
}

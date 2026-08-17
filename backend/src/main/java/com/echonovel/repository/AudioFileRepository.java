package com.echonovel.repository;

import com.echonovel.entity.AudioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AudioFileRepository extends JpaRepository<AudioFile, Long> {

    Optional<AudioFile> findFirstByChapterIdOrderByIdDesc(Long chapterId);

    java.util.List<AudioFile> findAllByChapterId(Long chapterId);

    boolean existsByChapterId(Long chapterId);
}

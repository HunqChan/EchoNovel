package com.echonovel.repository;

import com.echonovel.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndStoryId(Long userId, Long storyId);

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndStoryId(Long userId, Long storyId);
}

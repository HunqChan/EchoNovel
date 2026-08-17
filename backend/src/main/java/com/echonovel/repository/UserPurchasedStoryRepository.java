package com.echonovel.repository;

import com.echonovel.entity.UserPurchasedStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPurchasedStoryRepository extends JpaRepository<UserPurchasedStory, Long> {
    boolean existsByUserIdAndStoryId(Long userId, Long storyId);
    List<UserPurchasedStory> findByUserId(Long userId);
}

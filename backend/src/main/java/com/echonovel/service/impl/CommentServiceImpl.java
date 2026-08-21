package com.echonovel.service.impl;

import com.echonovel.dto.response.CommentResponse;
import com.echonovel.entity.Comment;
import com.echonovel.entity.Story;
import com.echonovel.entity.User;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.mapper.CommentMapper;
import com.echonovel.repository.CommentRepository;
import com.echonovel.repository.StoryRepository;
import com.echonovel.repository.UserRepository;
import com.echonovel.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final StoryRepository storyRepository;
    private final CommentMapper commentMapper;

    @Override
    @Transactional
    public CommentResponse addComment(String email, Long storyId, String content) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        Comment comment = Comment.builder()
                .user(user)
                .story(story)
                .content(content)
                .build();
        comment = commentRepository.save(comment);
        log.info("User {} commented on story {}", email, storyId);

        return commentMapper.toResponse(comment);
    }

    @Override
    public Page<CommentResponse> getComments(Long storyId, Pageable pageable) {
        return commentRepository.findByStoryIdOrderByCreatedAtDesc(storyId, pageable)
                .map(commentMapper::toResponse);
    }
}

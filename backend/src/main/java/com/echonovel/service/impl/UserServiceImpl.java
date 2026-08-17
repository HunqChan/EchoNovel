package com.echonovel.service.impl;

import com.echonovel.dto.request.UserUpdateRequest;
import com.echonovel.dto.request.VipUpdateRequest;
import com.echonovel.dto.response.UserResponse;
import com.echonovel.entity.User;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.mapper.UserMapper;
import com.echonovel.repository.UserRepository;
import com.echonovel.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Update user (Role, VIP status)
     */
    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Không cho phép hạ cấp chính mình nếu là admin (tuỳ chọn thêm)
        // Nhưng ở đây ta cứ cập nhật bình thường
        user.setRole(request.getRole());
        user.setIsVip(request.getIsVip());
        user = userRepository.save(user);

        log.info("User {} updated (Role: {}, VIP: {})", user.getEmail(), user.getRole(), user.getIsVip());
        return userMapper.toResponse(user);
    }

    /**
     * Update user VIP status (Admin) - Legacy method if needed, but we can keep it
     */
    @Override
    @Transactional
    public UserResponse updateUserVipStatus(Long userId, VipUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setIsVip(request.getIsVip());
        user = userRepository.save(user);

        log.info("User {} VIP status updated to {}", user.getEmail(), user.getIsVip());
        return userMapper.toResponse(user);
    }

    /**
     * Get all users (Admin)
     */
    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete user (Admin)
     */
    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepository.deleteById(userId);
        log.info("User {} deleted", userId);
    }
}

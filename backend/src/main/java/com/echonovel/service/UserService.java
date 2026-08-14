package com.echonovel.service;

import com.echonovel.dto.request.VipUpdateRequest;
import com.echonovel.dto.response.UserResponse;
import com.echonovel.entity.User;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Update user (Role, VIP status)
     */
    @Transactional
    public UserResponse updateUser(Long userId, com.echonovel.dto.request.UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Không cho phép hạ cấp chính mình nếu là admin (tuỳ chọn thêm)
        // Nhưng ở đây ta cứ cập nhật bình thường
        user.setRole(request.getRole());
        user.setIsVip(request.getIsVip());
        user = userRepository.save(user);

        log.info("User {} updated (Role: {}, VIP: {})", user.getEmail(), user.getRole(), user.getIsVip());
        return UserResponse.fromEntity(user);
    }

    /**
     * Update user VIP status (Admin) - Legacy method if needed, but we can keep it
     */
    @Transactional
    public UserResponse updateUserVipStatus(Long userId, VipUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setIsVip(request.getIsVip());
        user = userRepository.save(user);

        log.info("User {} VIP status updated to {}", user.getEmail(), user.getIsVip());
        return UserResponse.fromEntity(user);
    }

    /**
     * Get all users (Admin)
     */
    public java.util.List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Delete user (Admin)
     */
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepository.deleteById(userId);
        log.info("User {} deleted", userId);
    }
}

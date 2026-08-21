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
import com.echonovel.service.MailService;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;

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
        user.setVipType(request.getVipType());
        if (request.getVipType() == com.echonovel.enums.VipType.SUBSCRIPTION) {
            user.setVipExpireAt(request.getVipExpireAt());
            user.setIsVip(true);
        } else if (request.getVipType() == com.echonovel.enums.VipType.PERMANENT) {
            user.setVipExpireAt(null);
            user.setIsVip(true);
        } else {
            user.setVipExpireAt(null);
            user.setIsVip(false);
        }
        user = userRepository.save(user);

        log.info("User {} updated (Role: {}, VIP: {})", user.getEmail(), user.getRole(), user.getVipType());
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

        user.setVipType(request.getVipType());
        user.setIsVip(request.getVipType() != com.echonovel.enums.VipType.NONE);
        user = userRepository.save(user);

        log.info("User {} VIP status updated to {}", user.getEmail(), user.getVipType());
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

    @Override
    public UserResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, com.echonovel.dto.request.UserProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setUsername(request.getUsername());
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        log.info("User profile updated: {}", email);
        return userMapper.toResponse(user);
    }

    @Override
    public void sendChangePasswordOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        mailService.generateAndSendOtp(email, "CHANGE_PASSWORD");
    }

    @Override
    @Transactional
    public void changePassword(String email, com.echonovel.dto.request.ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // or a specific "INVALID_PASSWORD" error
        }

        if (!mailService.verifyOtp(email, request.getOtp())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", email);
    }
}

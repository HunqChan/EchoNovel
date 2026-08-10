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
     * Update user VIP status (Admin)
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
}

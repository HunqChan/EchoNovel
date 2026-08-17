package com.echonovel.mapper;

import com.echonovel.dto.request.RegisterRequest;
import com.echonovel.dto.response.UserResponse;
import com.echonovel.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper for User entity ↔ DTO conversions.
 */
@Component
public class UserMapper {

    /**
     * Convert RegisterRequest → User entity.
     * Note: password is NOT encoded here, role and isVip are NOT set.
     * The caller (AuthServiceImpl) is responsible for encoding password and setting defaults.
     */
    public User toEntity(RegisterRequest request) {
        return User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .build();
    }

    /**
     * Convert User entity → UserResponse DTO.
     */
    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .coins(user.getCoins())
                .vipType(user.getVipType() != null ? user.getVipType().name() : null)
                .vipExpireAt(user.getVipExpireAt())
                .provider(user.getProvider())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

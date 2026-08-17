package com.echonovel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String role;
    private Long coins;
    private String vipType;
    private LocalDateTime vipExpireAt;
    private String provider;
    private String avatarUrl;
    private LocalDateTime createdAt;
}

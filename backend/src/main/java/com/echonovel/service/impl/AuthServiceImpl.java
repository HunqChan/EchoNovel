package com.echonovel.service.impl;

import com.echonovel.dto.request.LoginRequest;
import com.echonovel.dto.request.RegisterRequest;
import com.echonovel.dto.response.AuthResponse;
import com.echonovel.entity.User;
import com.echonovel.enums.Role;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.mapper.UserMapper;
import com.echonovel.repository.UserRepository;
import com.echonovel.security.JwtTokenProvider;
import com.echonovel.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    /**
     * Register a new member account
     */
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check duplicates
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        // Create user via mapper + set security fields
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.MEMBER)
                .isVip(false)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        // Generate token
        String token = jwtTokenProvider.generateToken(
                user.getEmail(), user.getRole().name(), user.getIsVip()
        );

        return AuthResponse.of(token, userMapper.toResponse(user));
    }

    /**
     * Login with email and password
     */
    @Override
    public AuthResponse login(LoginRequest request) {
        // Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Load user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Generate token
        String token = jwtTokenProvider.generateToken(
                user.getEmail(), user.getRole().name(), user.getIsVip()
        );

        log.info("User logged in: {}", user.getEmail());
        return AuthResponse.of(token, userMapper.toResponse(user));
    }
}

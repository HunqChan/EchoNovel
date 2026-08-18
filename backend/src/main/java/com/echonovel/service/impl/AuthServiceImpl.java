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
import com.echonovel.repository.RefreshTokenRepository;
import com.echonovel.entity.RefreshToken;
import com.echonovel.security.JwtTokenProvider;
import com.echonovel.service.AuthService;
import com.echonovel.service.MailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final MailService mailService;

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElse(RefreshToken.builder().user(user).build());

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpiration));

        return refreshTokenRepository.save(refreshToken);
    }

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
                .vipType(com.echonovel.enums.VipType.NONE)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        // Generate token
        String token = jwtTokenProvider.generateToken(
                user.getEmail(), user.getRole().name(), user.getVipType().name()
        );

        RefreshToken refreshToken = createRefreshToken(user);

        return AuthResponse.of(token, refreshToken.getToken(), userMapper.toResponse(user));
    }

    /**
     * Login with email and password
     */
    @Override
    @Transactional
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
                user.getEmail(), user.getRole().name(), user.getVipType().name()
        );

        RefreshToken refreshToken = createRefreshToken(user);

        log.info("User logged in: {}", user.getEmail());
        return AuthResponse.of(token, refreshToken.getToken(), userMapper.toResponse(user));
    }

    @Override
    public void sendForgotPasswordOtp(com.echonovel.dto.request.ForgotPasswordRequest request) {
        if (!userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        mailService.generateAndSendOtp(request.getEmail(), "FORGOT_PASSWORD");
    }

    @Override
    @Transactional
    public void resetPassword(com.echonovel.dto.request.ResetPasswordRequest request) {
        if (!mailService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset successful for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(com.echonovel.dto.request.GoogleAuthRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getToken());
            if (idToken == null) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String subject = payload.getSubject();

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .email(email)
                        .username(name != null ? name : "user_" + UUID.randomUUID().toString().substring(0, 8))
                        .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                        .role(Role.MEMBER)
                        .vipType(com.echonovel.enums.VipType.NONE)
                        .provider("GOOGLE")
                        .providerId(subject)
                        .avatarUrl(pictureUrl)
                        .build();
                return userRepository.save(newUser);
            });

            // Nếu user đã tồn tại nhưng đăng nhập lần đầu bằng Google
            if (user.getProvider() == null || user.getProvider().equals("LOCAL")) {
                user.setProvider("GOOGLE");
                user.setProviderId(subject);
                if (user.getAvatarUrl() == null) {
                    user.setAvatarUrl(pictureUrl);
                }
                userRepository.save(user);
            }

            String token = jwtTokenProvider.generateToken(
                    user.getEmail(), user.getRole().name(), user.getVipType().name()
            );

            RefreshToken refreshToken = createRefreshToken(user);

            log.info("Google user logged in: {}", user.getEmail());
            return AuthResponse.of(token, refreshToken.getToken(), userMapper.toResponse(user));

        } catch (Exception e) {
            log.error("Google authentication failed", e);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshAccessToken(com.echonovel.dto.request.RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));

        if (refreshToken.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(refreshToken);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        
        // Generate new access token
        String token = jwtTokenProvider.generateToken(
                user.getEmail(), user.getRole().name(), user.getVipType().name()
        );

        // Rotate refresh token
        RefreshToken newRefreshToken = createRefreshToken(user);

        return AuthResponse.of(token, newRefreshToken.getToken(), userMapper.toResponse(user));
    }

    @Override
    @Transactional
    public void logout(com.echonovel.dto.request.LogoutRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken())
                .ifPresent(refreshTokenRepository::delete);
    }
}

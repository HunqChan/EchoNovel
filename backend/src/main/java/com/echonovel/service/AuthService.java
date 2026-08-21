package com.echonovel.service;

import com.echonovel.dto.request.LoginRequest;
import com.echonovel.dto.request.RegisterRequest;
import com.echonovel.dto.response.AuthResponse;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    /**
     * Send OTP for registration
     */
    void sendRegisterOtp(com.echonovel.dto.request.SendOtpRequest request);

    /**
     * Register a new member account.
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Login with email and password.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Send OTP for forgot password
     */
    void sendForgotPasswordOtp(com.echonovel.dto.request.ForgotPasswordRequest request);

    /**
     * Reset password with OTP
     */
    void resetPassword(com.echonovel.dto.request.ResetPasswordRequest request);

    /**
     * Google Login/Register
     */
    AuthResponse googleLogin(com.echonovel.dto.request.GoogleAuthRequest request);

    /**
     * Refresh Access Token
     */
    AuthResponse refreshAccessToken(com.echonovel.dto.request.RefreshTokenRequest request);

    /**
     * Logout
     */
    void logout(com.echonovel.dto.request.LogoutRequest request);
}

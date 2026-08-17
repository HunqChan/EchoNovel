package com.echonovel.service;

import com.echonovel.dto.request.LoginRequest;
import com.echonovel.dto.request.RegisterRequest;
import com.echonovel.dto.response.AuthResponse;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    /**
     * Register a new member account.
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Login with email and password.
     */
    AuthResponse login(LoginRequest request);
}

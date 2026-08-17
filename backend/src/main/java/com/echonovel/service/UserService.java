package com.echonovel.service;

import com.echonovel.dto.request.UserUpdateRequest;
import com.echonovel.dto.request.VipUpdateRequest;
import com.echonovel.dto.response.UserResponse;

import java.util.List;

/**
 * Service interface for user management operations.
 */
public interface UserService {

    /**
     * Update user (Role, VIP status).
     */
    UserResponse updateUser(Long userId, UserUpdateRequest request);

    /**
     * Update user VIP status (Admin).
     */
    UserResponse updateUserVipStatus(Long userId, VipUpdateRequest request);

    /**
     * Get all users (Admin).
     */
    List<UserResponse> getAllUsers();

    /**
     * Delete user (Admin).
     */
    void deleteUser(Long userId);
}

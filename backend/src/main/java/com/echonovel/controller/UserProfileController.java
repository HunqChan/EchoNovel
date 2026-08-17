package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.request.ChangePasswordRequest;
import com.echonovel.dto.request.UserProfileUpdateRequest;
import com.echonovel.dto.response.UserResponse;
import com.echonovel.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        UserResponse data = userService.getCurrentUserProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", data));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        UserResponse data = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", data));
    }

    @PostMapping("/change-password/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendChangePasswordOtp(Authentication authentication) {
        userService.sendChangePasswordOtp(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi về email của bạn", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }
}

package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.request.UserUpdateRequest;
import com.echonovel.dto.request.VipUpdateRequest;
import com.echonovel.dto.response.UserResponse;
import com.echonovel.service.UserService;
import com.echonovel.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final WalletService walletService;

    @PostMapping("/{userId}/coins")
    public ResponseEntity<ApiResponse<Void>> addCoins(
            @PathVariable Long userId,
            @RequestParam Long amount,
            @RequestParam(defaultValue = "Admin cấp xu") String description) {
        walletService.addCoins(userId, amount, description);
        return ResponseEntity.ok(ApiResponse.success("Cấp xu thành công", null));
    }

    @PutMapping("/{userId}/vip")
    public ResponseEntity<ApiResponse<UserResponse>> updateVipStatus(
            @PathVariable Long userId,
            @Valid @RequestBody VipUpdateRequest request) {
        UserResponse data = userService.updateUserVipStatus(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái VIP thành công", data));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse data = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin người dùng thành công", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Xóa người dùng thành công", null));
    }
}

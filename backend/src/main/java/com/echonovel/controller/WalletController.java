package com.echonovel.controller;

import com.echonovel.dto.ApiResponse;
import com.echonovel.dto.response.UserResponse;
import com.echonovel.entity.CoinTransaction;
import com.echonovel.service.UserService;
import com.echonovel.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final UserService userService;

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<UserResponse>> getBalance(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(userService.getCurrentUserProfile(email)));
    }

    @PostMapping("/buy-vip/{packageId}")
    public ResponseEntity<ApiResponse<Void>> buyVip(Authentication authentication, @PathVariable Long packageId) {
        walletService.buyVip(authentication.getName(), packageId);
        return ResponseEntity.ok(ApiResponse.success("Mua gói VIP thành công", null));
    }

    @PostMapping("/buy-story/{storyId}")
    public ResponseEntity<ApiResponse<Void>> buyStory(Authentication authentication, @PathVariable Long storyId) {
        walletService.buyStory(authentication.getName(), storyId);
        return ResponseEntity.ok(ApiResponse.success("Mua truyện thành công", null));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<CoinTransaction>>> getTransactions(Authentication authentication) {
        UserResponse user = userService.getCurrentUserProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(walletService.getTransactions(user.getId())));
    }
}

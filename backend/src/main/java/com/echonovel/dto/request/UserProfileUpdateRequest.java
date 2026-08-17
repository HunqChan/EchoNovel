package com.echonovel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {
    @NotBlank(message = "Tên hiển thị không được để trống")
    private String username;

    private String avatarUrl;
}

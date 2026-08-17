package com.echonovel.dto.request;

import com.echonovel.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @NotNull(message = "Role không được để trống")
    private Role role;

    @NotNull(message = "Trạng thái VIP không được để trống")
    private com.echonovel.enums.VipType vipType;
}

package com.echonovel.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VipUpdateRequest {

    @NotNull(message = "Trạng thái VIP không được để trống")
    private com.echonovel.enums.VipType vipType;
}

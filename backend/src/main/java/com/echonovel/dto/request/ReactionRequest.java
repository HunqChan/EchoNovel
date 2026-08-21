package com.echonovel.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReactionRequest {

    @NotNull(message = "Loại phản hồi không được để trống")
    private String type; // LIKE or DISLIKE
}

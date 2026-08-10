package com.echonovel.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryRequest {

    @NotBlank(message = "Tên truyện không được để trống")
    @Size(max = 255, message = "Tên truyện không quá 255 ký tự")
    private String title;

    @NotNull(message = "Tác giả không được để trống")
    private Long authorId;

    private Set<Long> genreIds;

    private String coverImage;

    private String description;

    private String status; // ONGOING, COMPLETED
}

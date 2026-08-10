package com.echonovel.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterRequest {

    @NotNull(message = "Story ID không được để trống")
    private Long storyId;

    @NotBlank(message = "Tiêu đề chương không được để trống")
    private String title;

    @NotBlank(message = "Nội dung chương không được để trống")
    private String content;

    @NotNull(message = "Số chương không được để trống")
    private Integer chapterNumber;

    private String accessLevel; // PUBLIC, MEMBER, VIP (default: PUBLIC)
}

package com.echonovel.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // ========== Auth ==========
    USER_NOT_FOUND("USER_NOT_FOUND", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "Email đã được sử dụng", HttpStatus.BAD_REQUEST),
    USERNAME_ALREADY_EXISTS("USERNAME_ALREADY_EXISTS", "Username đã được sử dụng", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("UNAUTHORIZED", "Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("ACCESS_DENIED", "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_OTP("INVALID_OTP", "Mã OTP không chính xác hoặc đã hết hạn", HttpStatus.BAD_REQUEST),

    // ========== JWT ==========
    INVALID_TOKEN("INVALID_TOKEN", "Token không hợp lệ", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("TOKEN_EXPIRED", "Token đã hết hạn", HttpStatus.UNAUTHORIZED),

    // ========== Story ==========
    STORY_NOT_FOUND("STORY_NOT_FOUND", "Không tìm thấy truyện", HttpStatus.NOT_FOUND),

    // ========== Chapter ==========
    CHAPTER_NOT_FOUND("CHAPTER_NOT_FOUND", "Không tìm thấy chương", HttpStatus.NOT_FOUND),
    CHAPTER_ACCESS_DENIED("CHAPTER_ACCESS_DENIED", "Bạn không đủ quyền truy cập chương này", HttpStatus.FORBIDDEN),
    CHAPTER_NUMBER_EXISTS("CHAPTER_NUMBER_EXISTS", "Số chương đã tồn tại trong truyện này", HttpStatus.BAD_REQUEST),

    // ========== Genre ==========
    GENRE_NOT_FOUND("GENRE_NOT_FOUND", "Không tìm thấy thể loại", HttpStatus.NOT_FOUND),
    GENRE_ALREADY_EXISTS("GENRE_ALREADY_EXISTS", "Thể loại đã tồn tại", HttpStatus.BAD_REQUEST),

    // ========== Author ==========
    AUTHOR_NOT_FOUND("AUTHOR_NOT_FOUND", "Không tìm thấy tác giả", HttpStatus.NOT_FOUND),

    // ========== Audio ==========
    AUDIO_NOT_FOUND("AUDIO_NOT_FOUND", "Chương này chưa có audio", HttpStatus.NOT_FOUND),
    TTS_GENERATION_FAILED("TTS_GENERATION_FAILED", "Tạo audio thất bại, vui lòng thử lại", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========== Upload ==========
    INVALID_FILE_TYPE("INVALID_FILE_TYPE", "Chỉ hỗ trợ file ảnh JPG, PNG, WebP", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE("FILE_TOO_LARGE", "Dung lượng file không được vượt quá 5MB", HttpStatus.BAD_REQUEST),
    UPLOAD_FAILED("UPLOAD_FAILED", "Upload ảnh thất bại, vui lòng thử lại", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========== General ==========
    VALIDATION_ERROR("VALIDATION_ERROR", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR("INTERNAL_ERROR", "Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

package com.echonovel.service;

public interface MailService {
    void generateAndSendOtp(String email, String type);
    boolean verifyOtp(String email, String otp);
}

package com.echonovel.service.impl;

import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.service.MailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;
    
    // email -> otp
    private final ConcurrentHashMap<String, String> otpStorage = new ConcurrentHashMap<>();
    // email -> expire time in ms
    private final ConcurrentHashMap<String, Long> otpExpireTime = new ConcurrentHashMap<>();

    private static final long EXPIRE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    @Override
    public void generateAndSendOtp(String email, String type) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        otpStorage.put(email, otp);
        otpExpireTime.put(email, System.currentTimeMillis() + EXPIRE_DURATION_MS);
        
        String subject = "Mã xác thực (OTP) từ EchoNovel";
        String content = buildOtpEmailContent(otp, type);
        
        sendHtmlEmail(email, subject, content);
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        if (!otpStorage.containsKey(email)) {
            return false;
        }
        
        Long expireTime = otpExpireTime.get(email);
        if (System.currentTimeMillis() > expireTime) {
            otpStorage.remove(email);
            otpExpireTime.remove(email);
            return false;
        }
        
        if (otpStorage.get(email).equals(otp)) {
            otpStorage.remove(email);
            otpExpireTime.remove(email);
            return true;
        }
        
        return false;
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể gửi email: " + e.getMessage());
        }
    }
    
    private String buildOtpEmailContent(String otp, String type) {
        String actionText;
        if (type.equals("FORGOT_PASSWORD")) {
            actionText = "yêu cầu khôi phục mật khẩu";
        } else if (type.equals("REGISTER")) {
            actionText = "yêu cầu đăng ký tài khoản mới";
        } else {
            actionText = "yêu cầu thay đổi mật khẩu";
        }
        return "<html>" +
                "<body style='font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>" +
                "<h2 style='color: #4f46e5; text-align: center;'>EchoNovel</h2>" +
                "<p style='color: #374151; font-size: 16px;'>Xin chào,</p>" +
                "<p style='color: #374151; font-size: 16px;'>Chúng tôi nhận được " + actionText + " cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình:</p>" +
                "<div style='background: #e0e7ff; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;'>" +
                "<span style='font-size: 32px; font-weight: bold; color: #4338ca; letter-spacing: 5px;'>" + otp + "</span>" +
                "</div>" +
                "<p style='color: #ef4444; font-size: 14px;'>Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>" +
                "<p style='color: #6b7280; font-size: 14px;'>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ.</p>" +
                "<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;' />" +
                "<p style='color: #9ca3af; font-size: 12px; text-align: center;'>Đây là email tự động, vui lòng không trả lời.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}

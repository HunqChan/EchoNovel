package com.echonovel.config;

import com.echonovel.entity.User;
import com.echonovel.enums.Role;
import com.echonovel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
    }

    private void seedAdminUser() {
        String adminEmail = "admin@echonovel.com";

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("⏭️  Admin account already exists: {}", adminEmail);
            return;
        }

        User admin = User.builder()
                .username("admin")
                .email(adminEmail)
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .isVip(true)
                .build();

        userRepository.save(admin);

        log.info("=========================================");
        log.info("✅ Default Admin account created!");
        log.info("   Email:    admin@echonovel.com");
        log.info("   Password: Admin@123");
        log.info("   Role:     ADMIN");
        log.info("   VIP:      true");
        log.info("=========================================");
    }
}

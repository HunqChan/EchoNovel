package com.echonovel.config;

import com.echonovel.entity.User;
import com.echonovel.enums.Role;
import com.echonovel.entity.VipPackage;
import com.echonovel.repository.UserRepository;
import com.echonovel.repository.VipPackageRepository;
import com.echonovel.enums.VipType;
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
    private final VipPackageRepository vipPackageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedVipPackages();
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
                .vipType(VipType.PERMANENT)
                .coins(99999L)
                .build();

        userRepository.save(admin);

        log.info("=========================================");
        log.info("✅ Default Admin account created!");
        log.info("   Email:    admin@echonovel.com");
        log.info("   Password: Admin@123");
        log.info("   Role:     ADMIN");
        log.info("   VIP:      PERMANENT");
        log.info("   Coins:    99999");
        log.info("=========================================");
    }

    private void seedVipPackages() {
        if (vipPackageRepository.count() > 0) return;

        vipPackageRepository.save(VipPackage.builder().name("Gói 1 tháng").durationDays(30).priceCoins(30L).description("Đọc full truyện VIP trong 30 ngày").build());
        vipPackageRepository.save(VipPackage.builder().name("Gói 3 tháng").durationDays(90).priceCoins(80L).description("Đọc full truyện VIP trong 90 ngày").build());
        vipPackageRepository.save(VipPackage.builder().name("Gói 6 tháng").durationDays(180).priceCoins(150L).description("Đọc full truyện VIP trong 180 ngày").build());
        vipPackageRepository.save(VipPackage.builder().name("Gói 1 năm").durationDays(365).priceCoins(250L).description("Đọc full truyện VIP trong 365 ngày").build());
        log.info("✅ Default VIP Packages created!");
    }
}

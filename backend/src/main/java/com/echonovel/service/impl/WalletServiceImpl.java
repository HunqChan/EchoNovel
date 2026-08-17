package com.echonovel.service.impl;

import com.echonovel.entity.*;
import com.echonovel.enums.TransactionType;
import com.echonovel.enums.VipType;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.*;
import com.echonovel.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {

    private final UserRepository userRepository;
    private final CoinTransactionRepository coinTransactionRepository;
    private final VipPackageRepository vipPackageRepository;
    private final StoryRepository storyRepository;
    private final UserPurchasedStoryRepository userPurchasedStoryRepository;

    @Override
    @Transactional
    public void addCoins(Long userId, Long amount, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setCoins(user.getCoins() + amount);
        userRepository.save(user);

        CoinTransaction tx = CoinTransaction.builder()
                .user(user)
                .amount(amount)
                .type(TransactionType.ADMIN_ADJUST)
                .description(description)
                .build();
        coinTransactionRepository.save(tx);
    }

    @Override
    @Transactional
    public void buyVip(String email, Long packageId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        VipPackage pkg = vipPackageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_ERROR));

        if (!Boolean.TRUE.equals(pkg.getIsActive())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        if (user.getCoins() < pkg.getPriceCoins()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR); // INSUFFICIENT_COINS
        }

        if (user.getVipType() == VipType.PERMANENT) {
            throw new AppException(ErrorCode.VALIDATION_ERROR); // ALREADY_PERMANENT_VIP
        }

        // Trừ xu
        user.setCoins(user.getCoins() - pkg.getPriceCoins());
        
        // Cộng hạn
        LocalDateTime now = LocalDateTime.now();
        if (user.getVipType() == VipType.SUBSCRIPTION && user.getVipExpireAt() != null && user.getVipExpireAt().isAfter(now)) {
            user.setVipExpireAt(user.getVipExpireAt().plusDays(pkg.getDurationDays()));
        } else {
            user.setVipType(VipType.SUBSCRIPTION);
            user.setVipExpireAt(now.plusDays(pkg.getDurationDays()));
        }

        userRepository.save(user);

        // Transaction
        CoinTransaction tx = CoinTransaction.builder()
                .user(user)
                .amount(-pkg.getPriceCoins())
                .type(TransactionType.BUY_VIP)
                .description("Mua gói VIP: " + pkg.getName())
                .build();
        coinTransactionRepository.save(tx);
    }

    @Override
    @Transactional
    public void buyStory(String email, Long storyId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new AppException(ErrorCode.STORY_NOT_FOUND));

        if (story.getPriceCoins() == null || story.getPriceCoins() <= 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR); // NOT_FOR_SALE
        }

        if (userPurchasedStoryRepository.existsByUserIdAndStoryId(user.getId(), story.getId())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR); // ALREADY_PURCHASED
        }

        if (user.getCoins() < story.getPriceCoins()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR); // INSUFFICIENT_COINS
        }

        // Trừ xu
        user.setCoins(user.getCoins() - story.getPriceCoins());
        userRepository.save(user);

        // Lưu sở hữu
        UserPurchasedStory purchased = UserPurchasedStory.builder()
                .user(user)
                .story(story)
                .priceCoinsAtPurchase(story.getPriceCoins())
                .build();
        userPurchasedStoryRepository.save(purchased);

        // Transaction
        CoinTransaction tx = CoinTransaction.builder()
                .user(user)
                .amount(-story.getPriceCoins())
                .type(TransactionType.BUY_STORY)
                .description("Mua trọn bộ truyện: " + story.getTitle())
                .build();
        coinTransactionRepository.save(tx);
    }

    @Override
    public List<CoinTransaction> getTransactions(Long userId) {
        return coinTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}

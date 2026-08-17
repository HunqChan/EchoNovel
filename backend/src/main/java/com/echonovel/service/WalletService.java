package com.echonovel.service;

import com.echonovel.entity.CoinTransaction;
import com.echonovel.entity.User;
import java.util.List;

public interface WalletService {
    void addCoins(Long userId, Long amount, String description);
    void buyVip(String email, Long packageId);
    void buyStory(String email, Long storyId);
    List<CoinTransaction> getTransactions(Long userId);
}

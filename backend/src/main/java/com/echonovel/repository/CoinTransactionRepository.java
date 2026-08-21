package com.echonovel.repository;

import com.echonovel.entity.CoinTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, Long> {
    List<CoinTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT FUNCTION('DATE', t.createdAt), SUM(ABS(t.amount)) FROM CoinTransaction t " +
        "WHERE t.type IN ('BUY_VIP', 'BUY_STORY') AND t.createdAt >= :since " +
        "GROUP BY FUNCTION('DATE', t.createdAt) ORDER BY FUNCTION('DATE', t.createdAt) ASC"
    )
    List<Object[]> sumRevenueByDay(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

    long countByType(com.echonovel.enums.TransactionType type);
}

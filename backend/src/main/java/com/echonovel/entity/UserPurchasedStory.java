package com.echonovel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_purchased_stories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPurchasedStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Column(name = "price_coins_at_purchase", nullable = false)
    private Long priceCoinsAtPurchase;

    @CreationTimestamp
    @Column(name = "purchased_at", updatable = false)
    private LocalDateTime purchasedAt;
}

package com.echonovel.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_history", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "story_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_chapter_id")
    private Chapter lastChapter;

    @Column(name = "progress_percent")
    @Builder.Default
    private Integer progressPercent = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

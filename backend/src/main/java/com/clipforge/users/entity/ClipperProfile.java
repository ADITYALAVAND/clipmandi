package com.clipforge.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "clipper_profiles")
@Getter
@Setter
@NoArgsConstructor
public class ClipperProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    private String bio;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "upi_id")
    private String upiId;

    @Column(name = "total_clips_submitted", nullable = false)
    private int totalClipsSubmitted = 0;

    @Column(name = "total_earned_paise", nullable = false)
    private long totalEarnedPaise = 0L;

    @Column(name = "trust_level", nullable = false)
    private short trustLevel = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

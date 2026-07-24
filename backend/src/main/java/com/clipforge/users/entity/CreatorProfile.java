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
@Table(name = "creator_profiles")
@Getter
@Setter
@NoArgsConstructor
public class CreatorProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "total_campaigns", nullable = false)
    private int totalCampaigns = 0;

    @Column(name = "total_spent_paise", nullable = false)
    private long totalSpentPaise = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

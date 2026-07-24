package com.clipforge.campaigns.entity;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "campaigns")
@Getter
@Setter
@NoArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "creator_id", nullable = false)
    private UUID creatorId;

    @Column(nullable = false)
    private String name;

    private String description;
    private String category;

    @Column(name = "cpm_paise", nullable = false)
    private Long cpmPaise;

    @Column(name = "budget_total_paise", nullable = false)
    private Long budgetTotalPaise;

    @Column(name = "budget_spent_paise", nullable = false)
    private Long budgetSpentPaise = 0L;

    // Maps Postgres TEXT[] directly — supported natively by Hibernate 6,
    // no extra dependency (e.g. hypersistence-utils) needed for this.
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_platforms", columnDefinition = "text[]", nullable = false)
    private List<String> allowedPlatforms;

   @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "campaign_status")
    private CampaignStatus status = CampaignStatus.DRAFT;

    private String rules;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}

package com.clipforge.campaigns.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clipforge.campaigns.entity.Campaign;

import jakarta.persistence.LockModeType;

public interface CampaignRepository
    extends JpaRepository<Campaign, UUID>,
            JpaSpecificationExecutor<Campaign> {

    Optional<Campaign> findByIdAndDeletedAtIsNull(
        UUID id
    );

    // ======================================================
    // LOCK CAMPAIGN DURING BUDGET UPDATE
    // ======================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT campaign
        FROM Campaign campaign
        WHERE campaign.id = :campaignId
          AND campaign.deletedAt IS NULL
    """)
    Optional<Campaign> findByIdForUpdate(
        @Param("campaignId") UUID campaignId
    );
}
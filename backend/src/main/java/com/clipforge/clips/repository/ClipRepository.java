package com.clipforge.clips.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clipforge.clips.entity.Clip;
import com.clipforge.clips.entity.ClipStatus;

import jakarta.persistence.LockModeType;

public interface ClipRepository extends JpaRepository<Clip, UUID> {

    List<Clip> findByClipperIdOrderBySubmittedAtDesc(UUID clipperId);

    List<Clip> findByCampaignIdOrderBySubmittedAtDesc(UUID campaignId);

    long countByCampaignId(UUID campaignId);

    @Query("""
        SELECT COALESCE(SUM(clip.views), 0)
        FROM Clip clip
        WHERE clip.campaignId = :campaignId
    """)
    Long sumViewsByCampaignId(
        @Param("campaignId") UUID campaignId
    );

    @Query("""
        SELECT clip
        FROM Clip clip
        JOIN Campaign campaign
            ON clip.campaignId = campaign.id
        WHERE campaign.creatorId = :creatorId
          AND campaign.deletedAt IS NULL
        ORDER BY clip.submittedAt DESC
    """)
    List<Clip> findAllForCreator(
        @Param("creatorId") UUID creatorId
    );

    // ======================================================
    // LOCK CLIP DURING MONEY / VIEW UPDATE
    // ======================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT clip
        FROM Clip clip
        WHERE clip.id = :clipId
    """)
    Optional<Clip> findByIdForUpdate(
        @Param("clipId") UUID clipId
    );

    // ======================================================
    // AUTOMATIC YOUTUBE SYNC
    // ======================================================

    List<Clip> findByStatusAndPlatformIgnoreCase(
        ClipStatus status,
        String platform
    );
}
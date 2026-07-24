package com.clipforge.clips.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clipforge.clips.entity.Clip;

public interface ClipRepository extends JpaRepository<Clip, UUID> {

    List<Clip> findByClipperIdOrderBySubmittedAtDesc(UUID clipperId);

    List<Clip> findByCampaignIdOrderBySubmittedAtDesc(UUID campaignId);

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
}
package com.clipforge.clips.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

import com.clipforge.clips.entity.Clip;
import com.clipforge.clips.entity.ClipStatus;

public record ClipResponse(

    UUID id,
    UUID campaignId,
    UUID clipperId,
    String platform,
    String contentUrl,
    ClipStatus status,
    Long views,
    BigDecimal earnings,
    Instant submittedAt,
    Instant reviewedAt

) {

    public static ClipResponse from(Clip clip) {

        BigDecimal earnings = BigDecimal
            .valueOf(clip.getEarningsPaise())
            .divide(
                BigDecimal.valueOf(100),
                2,
                RoundingMode.UNNECESSARY
            );

        return new ClipResponse(
            clip.getId(),
            clip.getCampaignId(),
            clip.getClipperId(),
            clip.getPlatform(),
            clip.getContentUrl(),
            clip.getStatus(),
            clip.getViews(),
            earnings,
            clip.getSubmittedAt(),
            clip.getReviewedAt()
        );
    }
}
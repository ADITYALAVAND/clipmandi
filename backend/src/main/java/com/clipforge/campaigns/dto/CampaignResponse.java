package com.clipforge.campaigns.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.clipforge.campaigns.entity.Campaign;
import com.clipforge.campaigns.entity.CampaignStatus;

public record CampaignResponse(
    UUID id,
    UUID creatorId,
    String name,
    String description,
    String category,
    BigDecimal cpm,
    BigDecimal budgetTotal,
    BigDecimal budgetSpent,
    List<String> allowedPlatforms,
    CampaignStatus status,
    Instant createdAt
) {
    public static CampaignResponse from(Campaign c) {
        return new CampaignResponse(
            c.getId(),
            c.getCreatorId(),
            c.getName(),
            c.getDescription(),
            c.getCategory(),
            toRupees(c.getCpmPaise()),
            toRupees(c.getBudgetTotalPaise()),
            toRupees(c.getBudgetSpentPaise()),
            c.getAllowedPlatforms(),
            c.getStatus(),
            c.getCreatedAt()
        );
    }

    private static BigDecimal toRupees(Long paise) {
        if (paise == null) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(paise, 2);
    }
}
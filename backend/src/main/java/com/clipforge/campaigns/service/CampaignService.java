package com.clipforge.campaigns.service;

import com.clipforge.campaigns.dto.CampaignResponse;
import com.clipforge.campaigns.dto.CreateCampaignRequest;
import com.clipforge.campaigns.entity.Campaign;
import com.clipforge.campaigns.entity.CampaignStatus;
import com.clipforge.campaigns.repository.CampaignRepository;
import com.clipforge.campaigns.repository.CampaignSpecs;
import com.clipforge.clips.repository.ClipRepository;
import com.clipforge.common.exception.BadRequestException;
import com.clipforge.common.exception.ForbiddenException;
import com.clipforge.common.exception.NotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final ClipRepository clipRepository;

    // ======================================================
    // CREATE CAMPAIGN
    // ======================================================

    @Transactional
    public CampaignResponse create(
        UUID creatorId,
        CreateCampaignRequest req
    ) {

        Campaign campaign = new Campaign();

        campaign.setCreatorId(creatorId);
        campaign.setName(req.name());
        campaign.setDescription(req.description());
        campaign.setCategory(req.category());

        campaign.setCpmPaise(
            toPaise(req.cpm())
        );

        campaign.setBudgetTotalPaise(
            toPaise(req.budgetTotal())
        );

        campaign.setAllowedPlatforms(
            req.allowedPlatforms()
        );

        campaign.setRules(
            req.rules()
        );

        campaign.setStatus(
            CampaignStatus.LIVE
        );

        Campaign saved =
            campaignRepository.save(campaign);

        return toResponse(saved);
    }

    // ======================================================
    // BROWSE CAMPAIGNS
    // ======================================================

    public Page<CampaignResponse> browse(
        CampaignStatus status,
        String category,
        Pageable pageable
    ) {

        Specification<Campaign> spec =
            Specification.where(
                CampaignSpecs.notDeleted()
            );

        if (status != null) {
            spec = spec.and(
                CampaignSpecs.hasStatus(status)
            );
        }

        if (category != null) {
            spec = spec.and(
                CampaignSpecs.hasCategory(category)
            );
        }

        return campaignRepository
            .findAll(spec, pageable)
            .map(this::toResponse);
    }

    // ======================================================
    // GET CAMPAIGN
    // ======================================================

    public CampaignResponse getById(UUID id) {

        Campaign campaign =
            campaignRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(
                    () -> new NotFoundException(
                        "Campaign not found"
                    )
                );

        return toResponse(campaign);
    }

    // ======================================================
    // RECORD CAMPAIGN SPEND
    // ======================================================

    @Transactional
    public void recordSpend(
        UUID campaignId,
        Long amountPaise
    ) {

        if (amountPaise == null || amountPaise < 0) {
            throw new BadRequestException(
                "Spend amount must be non-negative"
            );
        }

        Campaign campaign =
            campaignRepository
                .findByIdAndDeletedAtIsNull(
                    campaignId
                )
                .orElseThrow(
                    () -> new NotFoundException(
                        "Campaign not found"
                    )
                );

        long currentSpent =
            campaign.getBudgetSpentPaise() == null
                ? 0L
                : campaign.getBudgetSpentPaise();

        long newSpent;

        try {
            newSpent = Math.addExact(
                currentSpent,
                amountPaise
            );
        } catch (ArithmeticException ex) {
            throw new BadRequestException(
                "Campaign spend amount is too large"
            );
        }

        if (
            newSpent >
            campaign.getBudgetTotalPaise()
        ) {
            throw new BadRequestException(
                "This approval would exceed the campaign's remaining budget"
            );
        }

        campaign.setBudgetSpentPaise(
            newSpent
        );

        if (
            newSpent >=
            campaign.getBudgetTotalPaise()
        ) {
            campaign.setStatus(
                CampaignStatus.BUDGET_SPENT
            );
        }

        campaignRepository.save(campaign);
    }

    // ======================================================
    // VERIFY OWNERSHIP
    // ======================================================

    public void verifyOwnership(
        UUID campaignId,
        UUID requesterId
    ) {

        Campaign campaign =
            campaignRepository
                .findByIdAndDeletedAtIsNull(
                    campaignId
                )
                .orElseThrow(
                    () -> new NotFoundException(
                        "Campaign not found"
                    )
                );

        if (
            !campaign
                .getCreatorId()
                .equals(requesterId)
        ) {
            throw new ForbiddenException(
                "You don't have access to this campaign"
            );
        }
    }

    // ======================================================
    // CAMPAIGN -> RESPONSE WITH REAL STATISTICS
    // ======================================================

    private CampaignResponse toResponse(
        Campaign campaign
    ) {

        long clipsCount =
            clipRepository.countByCampaignId(
                campaign.getId()
            );

        Long totalViews =
            clipRepository.sumViewsByCampaignId(
                campaign.getId()
            );

        long views =
            totalViews == null
                ? 0L
                : totalViews;

        return CampaignResponse.from(
            campaign,
            views,
            clipsCount
        );
    }

    // ======================================================
    // RUPEES -> PAISE
    // ======================================================

    private long toPaise(
        BigDecimal rupees
    ) {

        return rupees
            .movePointRight(2)
            .setScale(
                0,
                RoundingMode.UNNECESSARY
            )
            .longValueExact();
    }
}
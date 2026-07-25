package com.clipforge.clips.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clipforge.campaigns.entity.Campaign;
import com.clipforge.campaigns.entity.CampaignStatus;
import com.clipforge.campaigns.repository.CampaignRepository;
import com.clipforge.campaigns.service.CampaignService;
import com.clipforge.clips.dto.ClipResponse;
import com.clipforge.clips.dto.SubmitClipRequest;
import com.clipforge.clips.entity.Clip;
import com.clipforge.clips.entity.ClipStatus;
import com.clipforge.clips.repository.ClipRepository;
import com.clipforge.clips.validation.PlatformUrlValidator;
import com.clipforge.common.exception.BadRequestException;
import com.clipforge.common.exception.ForbiddenException;
import com.clipforge.common.exception.NotFoundException;
import com.clipforge.verification.YouTubeVerificationService;
import com.clipforge.wallet.service.WalletService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClipService {

    private final ClipRepository clipRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignService campaignService;
    private final WalletService walletService;
    private final YouTubeVerificationService youtubeVerificationService;
    private final PlatformUrlValidator platformUrlValidator;

    // ======================================================
    // SUBMIT CLIP
    // ======================================================

    @Transactional
    public ClipResponse submit(
        UUID clipperId,
        SubmitClipRequest req
    ) {

        Campaign campaign = campaignRepository
            .findByIdAndDeletedAtIsNull(req.campaignId())
            .orElseThrow(
                () -> new NotFoundException("Campaign not found")
            );

        if (campaign.getStatus() != CampaignStatus.LIVE) {
            throw new BadRequestException(
                "This campaign is not accepting clip submissions"
            );
        }

        String platform = req.platform()
            .trim()
            .toUpperCase();

        if (
            campaign.getAllowedPlatforms() == null ||
            !campaign.getAllowedPlatforms().contains(platform)
        ) {
            throw new BadRequestException(
                "This platform is not allowed for this campaign"
            );
        }
        String contentUrl = req.contentUrl().trim();

            platformUrlValidator.validate(
            platform,
            contentUrl
        );

        Clip clip = new Clip();

        clip.setCampaignId(campaign.getId());
        clip.setClipperId(clipperId);
        clip.setPlatform(platform);
        clip.setContentUrl(contentUrl);

        clip.setStatus(ClipStatus.PENDING);
        clip.setViews(0L);
        clip.setEarningsPaise(0L);

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    // ======================================================
    // GET CLIPPER'S OWN CLIPS
    // ======================================================

    public List<ClipResponse> getMyClips(
        UUID clipperId
    ) {

        return clipRepository
            .findByClipperIdOrderBySubmittedAtDesc(
                clipperId
            )
            .stream()
            .map(ClipResponse::from)
            .toList();
    }

    // ======================================================
    // GET CAMPAIGN CLIPS
    // ======================================================

    public List<ClipResponse> getCampaignClips(
        UUID campaignId
    ) {

        campaignRepository
            .findByIdAndDeletedAtIsNull(campaignId)
            .orElseThrow(
                () -> new NotFoundException(
                    "Campaign not found"
                )
            );

        return clipRepository
            .findByCampaignIdOrderBySubmittedAtDesc(
                campaignId
            )
            .stream()
            .map(ClipResponse::from)
            .toList();
    }

    // ======================================================
    // CREATOR INBOX
    // ======================================================

    public List<ClipResponse> getCreatorInbox(
        UUID creatorId
    ) {

        return clipRepository
            .findAllForCreator(creatorId)
            .stream()
            .map(ClipResponse::from)
            .toList();
    }

    // ======================================================
    // APPROVE CLIP
    // ======================================================

    @Transactional
    public ClipResponse approveClip(
        UUID clipId,
        UUID creatorId
    ) {

        Clip clip = getClipForCreator(
            clipId,
            creatorId
        );

        if (clip.getStatus() != ClipStatus.PENDING) {
            throw new BadRequestException(
                "Only pending clips can be approved"
            );
        }

        clip.setStatus(ClipStatus.APPROVED);
        clip.setReviewedAt(Instant.now());

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    // ======================================================
    // REJECT CLIP
    // ======================================================

    @Transactional
    public ClipResponse rejectClip(
        UUID clipId,
        UUID creatorId
    ) {

        Clip clip = getClipForCreator(
            clipId,
            creatorId
        );

        if (clip.getStatus() != ClipStatus.PENDING) {
            throw new BadRequestException(
                "Only pending clips can be rejected"
            );
        }

        clip.setStatus(ClipStatus.REJECTED);
        clip.setReviewedAt(Instant.now());

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    // ======================================================
    // SYNC REAL YOUTUBE VIEWS
    // ======================================================

    @Transactional
    public ClipResponse syncYouTubeViews(
        UUID clipId,
        UUID creatorId
    ) {

        Clip clip = getClipForCreator(
            clipId,
            creatorId
        );

        if (clip.getStatus() != ClipStatus.APPROVED) {
            throw new BadRequestException(
                "Only approved clips can sync YouTube views"
            );
        }

        if (
            clip.getPlatform() == null ||
            !clip.getPlatform()
                .toUpperCase()
                .contains("YOUTUBE")
        ) {
            throw new BadRequestException(
                "This clip is not a YouTube submission"
            );
        }

        long youtubeViews =
            youtubeVerificationService.getViews(
                clip.getContentUrl()
            );

        return updateVerifiedViews(
            clipId,
            creatorId,
            youtubeViews
        );
    }

    // ======================================================
    // UPDATE VERIFIED VIEWS + EARNINGS
    // ======================================================

    @Transactional
    public ClipResponse updateVerifiedViews(
        UUID clipId,
        UUID creatorId,
        long newViews
    ) {

        // Views can never be negative.
        if (newViews < 0) {
            throw new BadRequestException(
                "Verified views cannot be negative"
            );
        }

        Clip clip = getClipForCreator(
            clipId,
            creatorId
        );

        // Only approved clips can earn money.
        if (clip.getStatus() != ClipStatus.APPROVED) {
            throw new BadRequestException(
                "Only approved clips can receive verified views"
            );
        }

        long currentViews =
            clip.getViews() == null
                ? 0L
                : clip.getViews();

        // Verified view counts must only increase.
        if (newViews < currentViews) {
            throw new BadRequestException(
                "Verified views cannot decrease"
            );
        }

        Campaign campaign = campaignRepository
            .findByIdAndDeletedAtIsNull(
                clip.getCampaignId()
            )
            .orElseThrow(
                () -> new NotFoundException(
                    "Campaign not found"
                )
            );

        long oldEarnings =
            clip.getEarningsPaise() == null
                ? 0L
                : clip.getEarningsPaise();

        /*
         * CPM is stored in paise and represents
         * payment for 1000 verified views.
         *
         * Example:
         *
         * CPM = ₹75
         * CPM paise = 7500
         *
         * 20,000 views:
         *
         * 20,000 * 7500 / 1000
         * = 150,000 paise
         * = ₹1,500
         */
        long newEarnings;

        try {
            newEarnings =
                Math.multiplyExact(
                    newViews,
                    campaign.getCpmPaise()
                ) / 1000L;
        } catch (ArithmeticException ex) {
            throw new BadRequestException(
                "Earnings calculation is too large"
            );
        }

        long additionalEarnings =
            newEarnings - oldEarnings;

        if (additionalEarnings < 0) {
            throw new BadRequestException(
                "Calculated earnings cannot decrease"
            );
        }

        /*
         * IMPORTANT:
         *
         * Only the DIFFERENCE is charged.
         *
         * Example:
         *
         * Previous earnings = ₹1,500
         * New earnings      = ₹2,250
         *
         * Campaign charged  = ₹750
         * Wallet credited   = ₹750
         *
         * This prevents paying the same views twice.
         */
        if (additionalEarnings > 0) {

            // ----------------------------------------------
            // 1. SPEND CAMPAIGN BUDGET
            // ----------------------------------------------
            //
            // recordSpend() checks whether enough campaign
            // budget remains.
            //
            // If the budget is exhausted, it also changes
            // campaign status to BUDGET_SPENT.

            campaignService.recordSpend(
                campaign.getId(),
                additionalEarnings
            );

            // ----------------------------------------------
            // 2. CREDIT CLIPPER WALLET
            // ----------------------------------------------

            walletService.creditClipEarnings(
                clip.getClipperId(),
                clip.getId(),
                additionalEarnings
            );
        }

        // ----------------------------------------------
        // 3. UPDATE CLIP
        // ----------------------------------------------

        clip.setViews(newViews);
        clip.setEarningsPaise(newEarnings);

        Clip saved =
            clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    // ======================================================
    // VERIFY CREATOR OWNS CLIP'S CAMPAIGN
    // ======================================================

    private Clip getClipForCreator(
        UUID clipId,
        UUID creatorId
    ) {

        Clip clip = clipRepository
            .findById(clipId)
            .orElseThrow(
                () -> new NotFoundException(
                    "Clip not found"
                )
            );

        Campaign campaign = campaignRepository
            .findByIdAndDeletedAtIsNull(
                clip.getCampaignId()
            )
            .orElseThrow(
                () -> new NotFoundException(
                    "Campaign not found"
                )
            );

        if (
            !campaign
                .getCreatorId()
                .equals(creatorId)
        ) {
            throw new ForbiddenException(
                "You cannot manage clips from another creator's campaign"
            );
        }

        return clip;
    }
}
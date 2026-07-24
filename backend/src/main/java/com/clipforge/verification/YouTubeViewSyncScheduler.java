package com.clipforge.verification;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.clipforge.campaigns.entity.Campaign;
import com.clipforge.campaigns.repository.CampaignRepository;
import com.clipforge.clips.entity.Clip;
import com.clipforge.clips.entity.ClipStatus;
import com.clipforge.clips.repository.ClipRepository;
import com.clipforge.clips.service.ClipService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class YouTubeViewSyncScheduler {

    private final ClipRepository clipRepository;
    private final CampaignRepository campaignRepository;
    private final ClipService clipService;

    /*
     * Automatically checks approved YouTube clips.
     *
     * Runs every 1 hour.
     *
     * The scheduler does NOT contain its own earnings
     * or wallet logic. It reuses ClipService so that
     * automatic syncing behaves exactly like the
     * manually tested Sync YouTube button.
     */
   @Scheduled(
    fixedDelayString = "${youtube.sync-interval-ms:3600000}"
    )
    public void syncApprovedYouTubeClips() {

        List<Clip> clips =
            clipRepository.findByStatusAndPlatformIgnoreCase(
                ClipStatus.APPROVED,
                "YOUTUBE"
            );

        if (clips.isEmpty()) {
            log.debug(
                "YouTube sync: no approved YouTube clips found"
            );
            return;
        }

        log.info(
            "YouTube sync: checking {} approved clip(s)",
            clips.size()
        );

        for (Clip clip : clips) {

            try {

                Campaign campaign =
                    campaignRepository
                        .findByIdAndDeletedAtIsNull(
                            clip.getCampaignId()
                        )
                        .orElse(null);

                if (campaign == null) {
                    log.warn(
                        "YouTube sync skipped clip {} because campaign was not found",
                        clip.getId()
                    );
                    continue;
                }

                /*
                 * Reuse the exact sync method we've already
                 * tested manually.
                 *
                 * The campaign creator ID is passed because
                 * syncYouTubeViews() verifies ownership.
                 */
                clipService.syncYouTubeViews(
                    clip.getId(),
                    campaign.getCreatorId()
                );

                log.info(
                    "YouTube sync successful for clip {}",
                    clip.getId()
                );

            } catch (Exception ex) {

                /*
                 * One broken/private/deleted video should
                 * NOT stop all other clips from syncing.
                 */
                log.error(
                    "YouTube sync failed for clip {}: {}",
                    clip.getId(),
                    ex.getMessage()
                );
            }
        }
    }
}
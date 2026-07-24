package com.clipforge.clips.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.clipforge.campaigns.service.CampaignService;
import com.clipforge.clips.dto.ClipResponse;
import com.clipforge.clips.dto.SubmitClipRequest;
import com.clipforge.clips.service.ClipService;
import com.clipforge.common.security.UserPrincipal;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/clips")
@RequiredArgsConstructor
public class ClipController {

    private final ClipService clipService;
    private final CampaignService campaignService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIPPER')")
    public ClipResponse submitClip(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody SubmitClipRequest request
    ) {
        return clipService.submit(
            principal.getId(),
            request
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('CREATOR')")
    public List<ClipResponse> getCreatorInbox(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return clipService.getCreatorInbox(
            principal.getId()
        );
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CLIPPER')")
    public List<ClipResponse> getMyClips(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return clipService.getMyClips(
            principal.getId()
        );
    }

    @GetMapping("/campaign/{campaignId}")
    @PreAuthorize("hasRole('CREATOR')")
    public List<ClipResponse> getCampaignClips(
        @PathVariable UUID campaignId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {

        campaignService.verifyOwnership(
            campaignId,
            principal.getId()
        );

        return clipService.getCampaignClips(
            campaignId
        );
    }

    @PatchMapping("/{clipId}/approve")
    @PreAuthorize("hasRole('CREATOR')")
    public ClipResponse approveClip(
        @PathVariable UUID clipId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return clipService.approveClip(
            clipId,
            principal.getId()
        );
    }

    @PatchMapping("/{clipId}/reject")
    @PreAuthorize("hasRole('CREATOR')")
    public ClipResponse rejectClip(
        @PathVariable UUID clipId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return clipService.rejectClip(
            clipId,
            principal.getId()
        );
    }

    // ======================================================
    // CREATOR: MANUAL YOUTUBE SYNC
    // Automatic syncing is handled by the scheduler.
    // This endpoint remains as a manual fallback.
    // ======================================================

    @PostMapping("/{clipId}/sync-youtube")
    @PreAuthorize("hasRole('CREATOR')")
    public ClipResponse syncYouTubeViews(
        @PathVariable UUID clipId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return clipService.syncYouTubeViews(
            clipId,
            principal.getId()
        );
    }
}
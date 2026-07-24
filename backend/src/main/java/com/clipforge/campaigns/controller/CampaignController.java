package com.clipforge.campaigns.controller;

import com.clipforge.campaigns.dto.CampaignResponse;
import com.clipforge.campaigns.dto.CreateCampaignRequest;
import com.clipforge.campaigns.entity.CampaignStatus;
import com.clipforge.campaigns.service.CampaignService;
import com.clipforge.common.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<CampaignResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateCampaignRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(campaignService.create(principal.getId(), req));
    }

    @GetMapping
    public ResponseEntity<Page<CampaignResponse>> browse(
            @RequestParam(required = false) CampaignStatus status,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(campaignService.browse(status, category, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(campaignService.getById(id));
    }
}

package com.clipforge.payments.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clipforge.common.security.UserPrincipal;
import com.clipforge.payments.dto.PaymentOrderResponse;
import com.clipforge.payments.dto.PaymentVerifyRequest;
import com.clipforge.payments.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // ======================================================
    // CREATOR: CREATE CAMPAIGN PAYMENT ORDER
    // ======================================================

    @PostMapping("/campaigns/{campaignId}/order")
    @PreAuthorize("hasRole('CREATOR')")
    public PaymentOrderResponse createCampaignOrder(
        @PathVariable UUID campaignId,
        @AuthenticationPrincipal UserPrincipal principal
    ) {

        return paymentService.createCampaignOrder(
            campaignId,
            principal.getId()
        );
    }
    // ======================================================
// CREATOR: VERIFY CAMPAIGN PAYMENT
// ======================================================

@PostMapping("/verify")
@PreAuthorize("hasRole('CREATOR')")
public void verifyPayment(
    @AuthenticationPrincipal UserPrincipal principal,
    @Valid @RequestBody PaymentVerifyRequest request
) {

    paymentService.verifyCampaignPayment(
        principal.getId(),
        request
    );
}
}
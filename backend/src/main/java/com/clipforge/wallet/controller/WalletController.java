package com.clipforge.wallet.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clipforge.common.security.UserPrincipal;
import com.clipforge.wallet.dto.WalletResponse;
import com.clipforge.wallet.service.WalletService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    // ======================================================
    // CLIPPER: GET WALLET
    // ======================================================

    @GetMapping
    @PreAuthorize("hasRole('CLIPPER')")
    public WalletResponse getWallet(
        @AuthenticationPrincipal UserPrincipal principal
    ) {

        return walletService.getWallet(
            principal.getId()
        );
    }
}
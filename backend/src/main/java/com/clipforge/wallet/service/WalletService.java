package com.clipforge.wallet.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clipforge.wallet.dto.WalletResponse;
import com.clipforge.wallet.entity.Wallet;
import com.clipforge.wallet.entity.WalletTransaction;
import com.clipforge.wallet.entity.WalletTransactionType;
import com.clipforge.wallet.repository.WalletRepository;
import com.clipforge.wallet.repository.WalletTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    // ======================================================
    // GET WALLET
    // ======================================================

    @Transactional
    public WalletResponse getWallet(UUID userId) {

        Wallet wallet = getOrCreateWallet(userId);

        List<WalletTransaction> transactions =
            transactionRepository
                .findByWalletIdOrderByCreatedAtDesc(
                    wallet.getId()
                );

        return WalletResponse.from(
            wallet,
            transactions
        );
    }

    // ======================================================
    // CREDIT CLIP EARNINGS
    // ======================================================

    @Transactional
    public void creditClipEarnings(
        UUID clipperId,
        UUID clipId,
        long amountPaise
    ) {

        if (amountPaise <= 0) {
            return;
        }

        Wallet wallet = getOrCreateWallet(clipperId);

        wallet.setBalancePaise(
            wallet.getBalancePaise() + amountPaise
        );

        wallet.setTotalEarnedPaise(
            wallet.getTotalEarnedPaise() + amountPaise
        );

        walletRepository.save(wallet);

        WalletTransaction transaction =
            new WalletTransaction();

        transaction.setWalletId(wallet.getId());
        transaction.setClipId(clipId);
        transaction.setType(
            WalletTransactionType.EARNING
        );
        transaction.setAmountPaise(amountPaise);
        transaction.setNote(
            "Earnings from verified clip views"
        );

        transactionRepository.save(transaction);
    }

    // ======================================================
    // GET OR CREATE WALLET
    // ======================================================

    private Wallet getOrCreateWallet(UUID userId) {

        return walletRepository
            .findByUserId(userId)
            .orElseGet(() -> {

                Wallet wallet = new Wallet();

                wallet.setUserId(userId);
                wallet.setBalancePaise(0L);
                wallet.setTotalEarnedPaise(0L);
                wallet.setTotalWithdrawnPaise(0L);

                return walletRepository.save(wallet);
            });
    }
}
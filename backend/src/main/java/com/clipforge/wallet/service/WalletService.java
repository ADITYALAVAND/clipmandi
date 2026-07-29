package com.clipforge.wallet.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clipforge.common.exception.BadRequestException;
import com.clipforge.wallet.dto.WalletResponse;
import com.clipforge.wallet.dto.WithdrawRequest;
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

        Wallet wallet = getWalletForUpdate(clipperId);

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
// WITHDRAW FROM WALLET
// ======================================================

@Transactional
public WalletResponse withdraw(
    UUID userId,
    WithdrawRequest request
) {

    // Convert rupees from API request into paise.
    long amountPaise;

    try {
        amountPaise = request.amount()
            .multiply(BigDecimal.valueOf(100))
            .setScale(0, RoundingMode.UNNECESSARY)
            .longValueExact();
    } catch (ArithmeticException ex) {
        throw new BadRequestException(
            "Invalid withdrawal amount"
        );
    }

    if (amountPaise <= 0) {
        throw new BadRequestException(
            "Withdrawal amount must be greater than zero"
        );
    }

    String upiId = request.upiId().trim();

    if (upiId.isEmpty()) {
        throw new BadRequestException(
            "UPI ID is required"
        );
    }

    Wallet wallet = getWalletForUpdate(userId);

    if (wallet.getBalancePaise() < amountPaise) {
        throw new BadRequestException(
            "Insufficient wallet balance"
        );
    }

    // Deduct available balance.
    wallet.setBalancePaise(
        wallet.getBalancePaise() - amountPaise
    );

    // Track lifetime withdrawals.
    wallet.setTotalWithdrawnPaise(
        wallet.getTotalWithdrawnPaise() + amountPaise
    );

    walletRepository.save(wallet);

    // Record withdrawal in transaction history.
    WalletTransaction transaction =
        new WalletTransaction();

    transaction.setWalletId(wallet.getId());
    transaction.setType(
        WalletTransactionType.WITHDRAWAL
    );

    // Negative amount represents money leaving the wallet.
    transaction.setAmountPaise(-amountPaise);

    transaction.setNote(
        "Withdrawal to " + upiId
    );

    transactionRepository.save(transaction);

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
    private Wallet getWalletForUpdate(UUID userId) {

    /*
     * First make sure the wallet exists.
     *
     * Wallet.userId has a UNIQUE constraint, so each user
     * can have only one wallet.
     */
    getOrCreateWallet(userId);

    /*
     * Re-read the wallet using PESSIMISTIC_WRITE.
     *
     * Any other transaction trying to modify this user's
     * wallet must wait until our transaction completes.
     */
    return walletRepository
        .findByUserIdForUpdate(userId)
        .orElseThrow(
            () -> new IllegalStateException(
                "Wallet could not be loaded"
            )
        );
}
}
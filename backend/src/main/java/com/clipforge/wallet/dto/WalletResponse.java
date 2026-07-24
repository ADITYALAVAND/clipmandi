package com.clipforge.wallet.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.clipforge.wallet.entity.Wallet;
import com.clipforge.wallet.entity.WalletTransaction;

public record WalletResponse(
    UUID id,
    double balance,
    double totalEarned,
    double totalWithdrawn,
    List<TransactionResponse> transactions
) {

    public static WalletResponse from(
        Wallet wallet,
        List<WalletTransaction> transactions
    ) {

        List<TransactionResponse> transactionResponses =
            transactions.stream()
                .map(TransactionResponse::from)
                .toList();

        return new WalletResponse(
            wallet.getId(),
            toRupees(wallet.getBalancePaise()),
            toRupees(wallet.getTotalEarnedPaise()),
            toRupees(wallet.getTotalWithdrawnPaise()),
            transactionResponses
        );
    }

    private static double toRupees(Long paise) {
        if (paise == null) {
            return 0;
        }

        return paise / 100.0;
    }

    public record TransactionResponse(
        UUID id,
        UUID clipId,
        String type,
        double amount,
        String note,
        Instant createdAt
    ) {

        public static TransactionResponse from(
            WalletTransaction transaction
        ) {

            return new TransactionResponse(
                transaction.getId(),
                transaction.getClipId(),
                transaction.getType().name(),
                transaction.getAmountPaise() / 100.0,
                transaction.getNote(),
                transaction.getCreatedAt()
            );
        }
    }
}
package com.clipforge.wallet.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clipforge.wallet.entity.WalletTransaction;

public interface WalletTransactionRepository
    extends JpaRepository<WalletTransaction, UUID> {

    List<WalletTransaction>
        findByWalletIdOrderByCreatedAtDesc(UUID walletId);

    boolean existsByClipIdAndType(
        UUID clipId,
        com.clipforge.wallet.entity.WalletTransactionType type
    );
}
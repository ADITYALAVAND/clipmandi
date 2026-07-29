package com.clipforge.wallet.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clipforge.wallet.entity.Wallet;

import jakarta.persistence.LockModeType;

public interface WalletRepository
    extends JpaRepository<Wallet, UUID> {

    Optional<Wallet> findByUserId(UUID userId);

    // ======================================================
    // LOCK WALLET DURING BALANCE UPDATE
    // ======================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT wallet
        FROM Wallet wallet
        WHERE wallet.userId = :userId
    """)
    Optional<Wallet> findByUserIdForUpdate(
        @Param("userId") UUID userId
    );
}
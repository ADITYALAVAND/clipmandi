package com.clipforge.payments.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "campaign_payments")
@Getter
@Setter
@NoArgsConstructor
public class CampaignPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "campaign_id", nullable = false)
    private UUID campaignId;

    @Column(name = "creator_id", nullable = false)
    private UUID creatorId;

    @Column(name = "amount_paise", nullable = false)
    private Long amountPaise;

    @Column(
        name = "razorpay_order_id",
        nullable = false,
        unique = true
    )
    private String razorpayOrderId;

    @Column(
        name = "razorpay_payment_id",
        unique = true
    )
    private String razorpayPaymentId;

    @Column(nullable = false)
    private String status;

    @CreationTimestamp
    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private Instant createdAt;

    @Column(name = "paid_at")
    private Instant paidAt;
}
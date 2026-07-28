package com.clipforge.payments.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clipforge.payments.entity.CampaignPayment;

public interface CampaignPaymentRepository
    extends JpaRepository<CampaignPayment, UUID> {

    Optional<CampaignPayment>
        findByRazorpayOrderId(String razorpayOrderId);

    Optional<CampaignPayment>
        findByRazorpayPaymentId(String razorpayPaymentId);

    Optional<CampaignPayment>
        findTopByCampaignIdOrderByCreatedAtDesc(UUID campaignId);
}
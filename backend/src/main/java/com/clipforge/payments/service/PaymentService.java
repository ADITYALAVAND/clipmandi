package com.clipforge.payments.service;

import java.time.Instant;
import java.util.UUID;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clipforge.campaigns.entity.Campaign;
import com.clipforge.campaigns.entity.CampaignStatus;
import com.clipforge.campaigns.repository.CampaignRepository;
import com.clipforge.common.exception.BadRequestException;
import com.clipforge.common.exception.ForbiddenException;
import com.clipforge.common.exception.NotFoundException;
import com.clipforge.payments.dto.PaymentOrderResponse;
import com.clipforge.payments.dto.PaymentVerifyRequest;
import com.clipforge.payments.entity.CampaignPayment;
import com.clipforge.payments.repository.CampaignPaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final CampaignRepository campaignRepository;
    private final CampaignPaymentRepository paymentRepository;

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    // ======================================================
    // CREATE RAZORPAY ORDER
    // ======================================================

    @Transactional
    public PaymentOrderResponse createCampaignOrder(
        UUID campaignId,
        UUID creatorId
    ) {

        if (
            keyId == null ||
            keyId.isBlank() ||
            keySecret == null ||
            keySecret.isBlank()
        ) {
            throw new BadRequestException(
                "Razorpay is not configured"
            );
        }

        Campaign campaign =
            campaignRepository
                .findByIdAndDeletedAtIsNull(campaignId)
                .orElseThrow(
                    () -> new NotFoundException(
                        "Campaign not found"
                    )
                );

        // Never allow another creator to pay/manage
        // somebody else's campaign.
        if (!campaign.getCreatorId().equals(creatorId)) {
            throw new ForbiddenException(
                "You don't have access to this campaign"
            );
        }

        if (
            campaign.getStatus() !=
            CampaignStatus.PENDING_FUNDING
        ) {
            throw new BadRequestException(
                "Campaign is not awaiting funding"
            );
        }

        long amountPaise =
            campaign.getBudgetTotalPaise();

        if (amountPaise <= 0) {
            throw new BadRequestException(
                "Campaign budget must be greater than zero"
            );
        }

        try {
            RazorpayClient razorpay =
                new RazorpayClient(
                    keyId,
                    keySecret
                );

            JSONObject orderRequest =
                new JSONObject();

            orderRequest.put(
                "amount",
                amountPaise
            );

            orderRequest.put(
                "currency",
                "INR"
            );

            /*
             * Razorpay receipts have a maximum length,
             * so don't use a long descriptive value.
             */
            String receipt =
                "cmp_" +
                campaign.getId()
                    .toString()
                    .replace("-", "")
                    .substring(0, 20) +
                "_" +
                UUID.randomUUID()
                    .toString()
                    .substring(0, 8);

            orderRequest.put(
                "receipt",
                receipt
            );

            JSONObject notes =
                new JSONObject();

            notes.put(
                "campaign_id",
                campaign.getId().toString()
            );

            notes.put(
                "creator_id",
                creatorId.toString()
            );

            orderRequest.put(
                "notes",
                notes
            );

            Order order =
                razorpay.orders.create(
                    orderRequest
                );

            String razorpayOrderId =
                order.get("id");

            CampaignPayment payment =
                new CampaignPayment();

            payment.setCampaignId(
                campaign.getId()
            );

            payment.setCreatorId(
                creatorId
            );

            payment.setAmountPaise(
                amountPaise
            );

            payment.setRazorpayOrderId(
                razorpayOrderId
            );

            payment.setStatus(
                "CREATED"
            );

            CampaignPayment saved =
                paymentRepository.save(payment);

            return new PaymentOrderResponse(
                saved.getId(),
                campaign.getId(),
                razorpayOrderId,
                amountPaise,
                "INR",
                keyId
            );

        } catch (Exception ex) {
            throw new BadRequestException(
                "Could not create Razorpay payment order: " +
                ex.getMessage()
            );
        }
    }
    // ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

@Transactional
public void verifyCampaignPayment(
    UUID creatorId,
    PaymentVerifyRequest request
) {

    if (
        keySecret == null ||
        keySecret.isBlank()
    ) {
        throw new BadRequestException(
            "Razorpay is not configured"
        );
    }

    CampaignPayment payment =
        paymentRepository
            .findByRazorpayOrderId(
                request.razorpayOrderId()
            )
            .orElseThrow(
                () -> new NotFoundException(
                    "Payment order not found"
                )
            );

    // Payment must belong to logged-in creator.
    if (
        !payment
            .getCreatorId()
            .equals(creatorId)
    ) {
        throw new ForbiddenException(
            "You don't have access to this payment"
        );
    }

    // Idempotency protection.
    if ("PAID".equals(payment.getStatus())) {
        return;
    }

    try {

        /*
         * IMPORTANT:
         * Use the order ID stored in OUR database.
         * Never trust an order ID supplied by the browser
         * for signature generation.
         */
        JSONObject options =
            new JSONObject();

        options.put(
            "razorpay_order_id",
            payment.getRazorpayOrderId()
        );

        options.put(
            "razorpay_payment_id",
            request.razorpayPaymentId()
        );

        options.put(
            "razorpay_signature",
            request.razorpaySignature()
        );

        boolean valid =
            Utils.verifyPaymentSignature(
                options,
                keySecret
            );

        if (!valid) {
            throw new BadRequestException(
                "Payment signature verification failed"
            );
        }

        Campaign campaign =
            campaignRepository
                .findByIdAndDeletedAtIsNull(
                    payment.getCampaignId()
                )
                .orElseThrow(
                    () -> new NotFoundException(
                        "Campaign not found"
                    )
                );

        if (
            !campaign
                .getCreatorId()
                .equals(creatorId)
        ) {
            throw new ForbiddenException(
                "You don't have access to this campaign"
            );
        }

        payment.setRazorpayPaymentId(
            request.razorpayPaymentId()
        );

        payment.setStatus("PAID");
        payment.setPaidAt(Instant.now());

        paymentRepository.save(payment);

        campaign.setStatus(
            CampaignStatus.LIVE
        );

        campaignRepository.save(campaign);

    } catch (BadRequestException |
             NotFoundException |
             ForbiddenException ex) {

        throw ex;

    } catch (Exception ex) {

        throw new BadRequestException(
            "Payment verification failed"
        );
    }
}
}
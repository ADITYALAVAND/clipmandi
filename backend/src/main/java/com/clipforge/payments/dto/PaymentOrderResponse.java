package com.clipforge.payments.dto;

import java.util.UUID;

public record PaymentOrderResponse(
    UUID paymentId,
    UUID campaignId,
    String razorpayOrderId,
    long amountPaise,
    String currency,
    String keyId
) {}
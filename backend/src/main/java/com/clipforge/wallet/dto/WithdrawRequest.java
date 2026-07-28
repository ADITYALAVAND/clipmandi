package com.clipforge.wallet.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WithdrawRequest(

    @NotNull(message = "Amount is required")
    @DecimalMin(
        value = "1.00",
        message = "Minimum withdrawal amount is ₹1"
    )
    BigDecimal amount,

    @NotBlank(message = "UPI ID is required")
    String upiId

) {}
package com.clipforge.campaigns.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CreateCampaignRequest(
    @NotBlank String name,
    String description,
    String category,

    @NotNull
    @DecimalMin(value = "0.01", message = "CPM must be at least ₹0.01")
    @Digits(integer = 12, fraction = 2, message = "CPM can have at most 2 decimal places")
    BigDecimal cpm,

    @NotNull
    @DecimalMin(value = "100.00", message = "Minimum campaign budget is ₹100")
    @Digits(integer = 12, fraction = 2, message = "Budget can have at most 2 decimal places")
    BigDecimal budgetTotal,

    @NotEmpty List<String> allowedPlatforms,
    String rules
) {}
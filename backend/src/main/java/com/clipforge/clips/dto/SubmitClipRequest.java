package com.clipforge.clips.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitClipRequest(

    @NotNull
    UUID campaignId,

    @NotBlank
    String platform,

    @NotBlank
    String contentUrl

) {}
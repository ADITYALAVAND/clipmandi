package com.clipforge.clips.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateClipViewsRequest(

    @NotNull
    @Min(0)
    Long views

) {}
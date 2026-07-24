package com.clipforge.common.exception;

import java.time.Instant;

public record ErrorResponse(String message, int status, Instant timestamp, String path) {
}

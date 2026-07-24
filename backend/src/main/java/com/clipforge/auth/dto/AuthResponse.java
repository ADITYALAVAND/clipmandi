package com.clipforge.auth.dto;

import com.clipforge.users.entity.UserRole;

import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    UUID userId,
    UserRole role,
    String displayName
) {}

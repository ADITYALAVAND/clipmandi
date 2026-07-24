package com.clipforge.auth.service;

import com.clipforge.auth.dto.AuthResponse;
import com.clipforge.auth.dto.LoginRequest;
import com.clipforge.auth.dto.RefreshRequest;
import com.clipforge.auth.dto.RegisterRequest;
import com.clipforge.common.exception.ConflictException;
import com.clipforge.common.exception.UnauthorizedException;
import com.clipforge.common.security.JwtService;
import com.clipforge.common.security.RefreshToken;
import com.clipforge.common.security.RefreshTokenRepository;
import com.clipforge.users.entity.ClipperProfile;
import com.clipforge.users.entity.CreatorProfile;
import com.clipforge.users.entity.User;
import com.clipforge.users.repository.ClipperProfileRepository;
import com.clipforge.users.repository.CreatorProfileRepository;
import com.clipforge.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final ClipperProfileRepository clipperProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ConflictException("An account with this email already exists");
        }
        if (req.role() == com.clipforge.users.entity.UserRole.ADMIN) {
            // Admins are never created via public registration — provisioned
            // separately (CLI seeder), see backend README.
            throw new ConflictException("This role can't be self-registered");
        }

        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setDisplayName(req.displayName());
        user.setRole(req.role());
        userRepository.save(user);

        createRoleProfile(user);

        return issueTokenPair(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(req.email())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been suspended");
        }
        if (user.getPasswordHash() == null || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return issueTokenPair(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        String tokenHash = jwtService.hashToken(req.refreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (stored.getRevokedAt() != null || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        // Rotation: revoke the used token, issue a brand new pair.
        stored.setRevokedAt(Instant.now());
        refreshTokenRepository.save(stored);

        User user = userRepository.findById(stored.getUserId())
            .orElseThrow(() -> new UnauthorizedException("User not found"));

        return issueTokenPair(user);
    }

    private AuthResponse issueTokenPair(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = jwtService.generateOpaqueRefreshToken();

        RefreshToken refreshEntity = new RefreshToken();
        refreshEntity.setUserId(user.getId());
        refreshEntity.setTokenHash(jwtService.hashToken(rawRefreshToken));
        refreshEntity.setExpiresAt(Instant.now().plus(jwtService.getRefreshTokenTtlDays(), ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshEntity);

        return new AuthResponse(accessToken, rawRefreshToken, user.getId(), user.getRole(), user.getDisplayName());
    }

    private void createRoleProfile(User user) {
        switch (user.getRole()) {
            case CREATOR -> {
                CreatorProfile profile = new CreatorProfile();
                profile.setUserId(user.getId());
                creatorProfileRepository.save(profile);
            }
            case CLIPPER -> {
                ClipperProfile profile = new ClipperProfile();
                profile.setUserId(user.getId());
                clipperProfileRepository.save(profile);
            }
            case ADMIN -> { /* admins are provisioned separately, never here */ }
        }
    }
}

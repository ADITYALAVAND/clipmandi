package com.clipforge.users.repository;

import com.clipforge.users.entity.ClipperProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClipperProfileRepository extends JpaRepository<ClipperProfile, UUID> {
}

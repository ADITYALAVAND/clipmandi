package com.clipforge.users.repository;

import com.clipforge.users.entity.CreatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, UUID> {
}

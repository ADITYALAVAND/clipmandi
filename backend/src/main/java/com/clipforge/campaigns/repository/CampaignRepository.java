package com.clipforge.campaigns.repository;

import com.clipforge.campaigns.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface CampaignRepository extends JpaRepository<Campaign, UUID>, JpaSpecificationExecutor<Campaign> {

    Optional<Campaign> findByIdAndDeletedAtIsNull(UUID id);
}

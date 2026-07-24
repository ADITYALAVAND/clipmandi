package com.clipforge.campaigns.repository;

import com.clipforge.campaigns.entity.Campaign;
import com.clipforge.campaigns.entity.CampaignStatus;
import org.springframework.data.jpa.domain.Specification;

public class CampaignSpecs {

    private CampaignSpecs() {}

    public static Specification<Campaign> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Campaign> hasStatus(CampaignStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Campaign> hasCategory(String category) {
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }
}

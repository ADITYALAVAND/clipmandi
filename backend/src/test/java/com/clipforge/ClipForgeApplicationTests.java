package com.clipforge;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Verifies the Spring context wires up correctly — all beans, JPA mappings,
 * and the Flyway migration apply without error. This needs a running
 * Postgres (see docker-compose.yml) since it's a full context load, not a
 * sliced/mocked test.
 */
@SpringBootTest
@ActiveProfiles("test")
class ClipForgeApplicationTests {

    @Test
    void contextLoads() {
        // Intentionally empty — a failing context load fails this test
        // with a clear stack trace, which is the actual assertion.
    }
}

package com.clipforge.common.cli;

import com.clipforge.users.entity.User;
import com.clipforge.users.entity.UserRole;
import com.clipforge.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates an admin account. There is deliberately no public API endpoint
 * that can produce an ADMIN role — this CLI path is the only way one gets
 * created, which keeps "admin creation" off the public attack surface.
 *
 * Usage (after the app is already runnable):
 *   mvn spring-boot:run -Dspring-boot.run.arguments="--seed-admin --email=you@clipforge.com --password=changeme123"
 */
@Component
@RequiredArgsConstructor
@Order(1)
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!args.containsOption("seed-admin")) return;

        String email = firstOrNull(args, "email");
        String password = firstOrNull(args, "password");

        if (email == null || password == null) {
            System.out.println("Usage: --seed-admin --email=you@clipforge.com --password=yourpassword");
            return;
        }

        if (userRepository.existsByEmail(email)) {
            System.out.println("A user already exists for " + email);
            return;
        }

        User admin = new User();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setDisplayName("Admin");
        admin.setRole(UserRole.ADMIN);
        admin.setVerified(true);
        userRepository.save(admin);

        System.out.println("Admin account created for " + email);
    }

    private String firstOrNull(ApplicationArguments args, String option) {
        var values = args.getOptionValues(option);
        return (values == null || values.isEmpty()) ? null : values.get(0);
    }
}

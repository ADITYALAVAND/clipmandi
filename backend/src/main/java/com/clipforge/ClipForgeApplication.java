package com.clipforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ClipForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClipForgeApplication.class, args);
    }
}
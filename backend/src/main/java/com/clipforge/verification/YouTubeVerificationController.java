package com.clipforge.verification;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dev/youtube")
@RequiredArgsConstructor
public class YouTubeVerificationController {

    private final YouTubeVerificationService youtubeVerificationService;

    @GetMapping("/views")
    public Map<String, Object> getViews(
        @RequestParam String url
    ) {

        String videoId =
            youtubeVerificationService.extractVideoId(url);

        long views =
            youtubeVerificationService.getViews(url);

        return Map.of(
            "videoId", videoId,
            "views", views
        );
    }
}
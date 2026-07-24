package com.clipforge.verification;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.clipforge.common.exception.BadRequestException;

@Service
public class YouTubeVerificationService {

    private final RestClient restClient;
    private final String apiKey;

    public YouTubeVerificationService(
        @Value("${youtube.api-key:}") String apiKey
    ) {
        this.apiKey = apiKey;

        this.restClient = RestClient.builder()
            .baseUrl("https://www.googleapis.com/youtube/v3")
            .build();
    }

    // ======================================================
    // GET CURRENT YOUTUBE VIEWS
    // ======================================================

    public long getViews(String videoUrl) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "YOUTUBE_API_KEY is not configured"
            );
        }

        String videoId = extractVideoId(videoUrl);

        YouTubeVideoListResponse response;

        try {
            response = restClient
                .get()
                .uri(uriBuilder -> uriBuilder
                    .path("/videos")
                    .queryParam("part", "statistics")
                    .queryParam("id", videoId)
                    .queryParam("key", apiKey)
                    .build()
                )
                .retrieve()
                .body(YouTubeVideoListResponse.class);

        } catch (Exception ex) {
            throw new BadRequestException(
                "Unable to retrieve video statistics from YouTube"
            );
        }

        if (
            response == null ||
            response.items() == null ||
            response.items().isEmpty()
        ) {
            throw new BadRequestException(
                "YouTube video not found or unavailable"
            );
        }

        YouTubeStatistics statistics =
            response.items().get(0).statistics();

        if (
            statistics == null ||
            statistics.viewCount() == null
        ) {
            throw new BadRequestException(
                "YouTube view count is unavailable"
            );
        }

        try {
            return Long.parseLong(
                statistics.viewCount()
            );
        } catch (NumberFormatException ex) {
            throw new BadRequestException(
                "Invalid YouTube view count"
            );
        }
    }

    // ======================================================
    // EXTRACT VIDEO ID
    // ======================================================

    public String extractVideoId(String videoUrl) {

        if (videoUrl == null || videoUrl.isBlank()) {
            throw new BadRequestException(
                "YouTube URL is required"
            );
        }

        try {
            URI uri = URI.create(videoUrl.trim());

            String host = uri.getHost();

            if (host == null) {
                throw new BadRequestException(
                    "Invalid YouTube URL"
                );
            }

            host = host.toLowerCase();

            // youtu.be/VIDEO_ID
            if (
                host.equals("youtu.be") ||
                host.equals("www.youtu.be")
            ) {
                String path = uri.getPath();

                if (path != null && path.length() > 1) {
                    return cleanVideoId(
                        path.substring(1)
                    );
                }
            }

            if (
                host.equals("youtube.com") ||
                host.equals("www.youtube.com") ||
                host.equals("m.youtube.com")
            ) {

                String path = uri.getPath();

                // youtube.com/shorts/VIDEO_ID
                if (
                    path != null &&
                    path.startsWith("/shorts/")
                ) {
                    return cleanVideoId(
                        path.substring(
                            "/shorts/".length()
                        )
                    );
                }

                // youtube.com/embed/VIDEO_ID
                if (
                    path != null &&
                    path.startsWith("/embed/")
                ) {
                    return cleanVideoId(
                        path.substring(
                            "/embed/".length()
                        )
                    );
                }

                // youtube.com/watch?v=VIDEO_ID
                String query = uri.getQuery();

                if (query != null) {
                    for (String parameter : query.split("&")) {

                        String[] pair =
                            parameter.split("=", 2);

                        if (
                            pair.length == 2 &&
                            pair[0].equals("v")
                        ) {
                            return cleanVideoId(
                                pair[1]
                            );
                        }
                    }
                }
            }

        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                "Invalid YouTube URL"
            );
        }

        throw new BadRequestException(
            "Unsupported YouTube URL"
        );
    }

    // ======================================================
    // CLEAN + VALIDATE VIDEO ID
    // ======================================================

    private String cleanVideoId(String value) {

        String videoId = value;

        int slash = videoId.indexOf('/');

        if (slash >= 0) {
            videoId = videoId.substring(0, slash);
        }

        int questionMark = videoId.indexOf('?');

        if (questionMark >= 0) {
            videoId =
                videoId.substring(0, questionMark);
        }

        if (!videoId.matches("[A-Za-z0-9_-]{11}")) {
            throw new BadRequestException(
                "Invalid YouTube video ID"
            );
        }

        return videoId;
    }

    // ======================================================
    // YOUTUBE API RESPONSE DTOs
    // ======================================================

    private record YouTubeVideoListResponse(
        List<YouTubeVideoItem> items
    ) {}

    private record YouTubeVideoItem(
        YouTubeStatistics statistics
    ) {}

    private record YouTubeStatistics(
        String viewCount
    ) {}
}
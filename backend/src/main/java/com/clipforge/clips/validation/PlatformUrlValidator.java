package com.clipforge.clips.validation;

import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.stereotype.Component;

import com.clipforge.common.exception.BadRequestException;

@Component
public class PlatformUrlValidator {

    public void validate(
        String platform,
        String contentUrl
    ) {

        if (contentUrl == null || contentUrl.isBlank()) {
            throw new BadRequestException(
                "Clip URL is required"
            );
        }

        URI uri;

        try {
            uri = new URI(contentUrl.trim());
        } catch (URISyntaxException ex) {
            throw new BadRequestException(
                "Invalid clip URL"
            );
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();

        if (
            scheme == null ||
            (!scheme.equalsIgnoreCase("http") &&
             !scheme.equalsIgnoreCase("https")) ||
            host == null
        ) {
            throw new BadRequestException(
                "Invalid clip URL"
            );
        }

        host = host.toLowerCase();

        if (host.startsWith("www.")) {
            host = host.substring(4);
        }

        switch (platform) {

            case "YOUTUBE" ->
                validateYouTube(host, uri);

            case "INSTAGRAM" ->
                validateInstagram(host, uri);

            case "TIKTOK" ->
                validateTikTok(host, uri);

            default ->
                throw new BadRequestException(
                    "Unsupported platform"
                );
        }
    }


    private void validateYouTube(
        String host,
        URI uri
    ) {

        boolean validHost =
            host.equals("youtube.com") ||
            host.equals("m.youtube.com") ||
            host.equals("youtu.be");

        if (!validHost) {
            throw new BadRequestException(
                "Please submit a valid YouTube URL"
            );
        }

        String path =
            uri.getPath() == null
                ? ""
                : uri.getPath();

        boolean validPath;

        if (host.equals("youtu.be")) {

            validPath =
                path.length() > 1;

        } else {

            validPath =
                path.startsWith("/shorts/") ||
                path.equals("/watch");
        }

        if (!validPath) {
            throw new BadRequestException(
                "Please submit a valid YouTube video or Short URL"
            );
        }

        if (
            path.equals("/watch") &&
            (
                uri.getQuery() == null ||
                !uri.getQuery().contains("v=")
            )
        ) {
            throw new BadRequestException(
                "Please submit a valid YouTube video URL"
            );
        }
    }


    private void validateInstagram(
        String host,
        URI uri
    ) {

        if (!host.equals("instagram.com")) {
            throw new BadRequestException(
                "Please submit a valid Instagram URL"
            );
        }

        String path =
            uri.getPath() == null
                ? ""
                : uri.getPath();

        boolean valid =
            path.startsWith("/reel/") ||
            path.startsWith("/reels/") ||
            path.startsWith("/p/");

        if (!valid) {
            throw new BadRequestException(
                "Please submit a valid Instagram post or Reel URL"
            );
        }
    }


    private void validateTikTok(
        String host,
        URI uri
    ) {

        boolean validHost =
            host.equals("tiktok.com") ||
            host.equals("m.tiktok.com") ||
            host.equals("vm.tiktok.com") ||
            host.equals("vt.tiktok.com");

        if (!validHost) {
            throw new BadRequestException(
                "Please submit a valid TikTok URL"
            );
        }

        String path =
            uri.getPath() == null
                ? ""
                : uri.getPath();

        if (path.isBlank() || path.equals("/")) {
            throw new BadRequestException(
                "Please submit a valid TikTok video URL"
            );
        }
    }
}
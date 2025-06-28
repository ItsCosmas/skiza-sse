package dev.cozy.skizasse;

public record PostbackEvent(String postbackBody, String sourceIP) {
}
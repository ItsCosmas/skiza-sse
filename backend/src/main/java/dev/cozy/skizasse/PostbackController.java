package dev.cozy.skizasse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/postbacks")
public class PostbackController {

    private static final Logger log = LoggerFactory.getLogger(PostbackController.class);
    private final Sinks.Many<PostbackEvent> sink = Sinks.many().replay().limit(3);

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<?>> streamPostbacks(@RequestHeader(name = "Last-Event-ID", required = false) String lastEventId, ServerHttpRequest request) {
        String sourceIp = Optional.ofNullable(request.getRemoteAddress())
                .map(addr -> addr.getAddress().getHostAddress())
                .orElse("unknown");

        log.info("New SSE connection from IP: {}", sourceIp);

        long resumeFrom = parseLastEventId(lastEventId);
        AtomicLong counter = new AtomicLong(resumeFrom + 1); // Local per-connection counter

        // Stream real events
        Flux<ServerSentEvent<?>> dataEvents = sink.asFlux()
                .doOnNext(event -> log.info("Emitting event {} with ID: {} to IP: {}:", event, counter.get(), sourceIp))
                .map(event -> ServerSentEvent.builder(event)
                        .id(String.valueOf(counter.getAndIncrement()))
                        .event("postback")
                        .build());

        // Heartbeat every 15 seconds
        Flux<ServerSentEvent<?>> heartbeats = Flux.interval(Duration.ofSeconds(15))
                .map(i -> ServerSentEvent.<Object>builder()
                        .comment("heartbeat")
                        .build());

        return Flux.merge(dataEvents, heartbeats).doFinally(signalType -> log.info("SSE Connection closed from IP: {} closed with signal: {}", sourceIp, signalType));
    }

    @PostMapping(consumes = {MediaType.ALL_VALUE})
    public ResponseEntity<String> receivePostback(@RequestBody String rawBody, ServerHttpRequest request) {
        String sourceIp = Optional.ofNullable(request.getRemoteAddress())
                .map(addr -> addr.getAddress().getHostAddress())
                .orElse("unknown");
        PostbackEvent response = new PostbackEvent(rawBody, sourceIp);
        log.info("Received postback from IP: {}: Body: {}", sourceIp, rawBody);

        Sinks.EmitResult result = sink.tryEmitNext(response);

        if (!result.isSuccess()) {
            log.warn("Failed to emit to SSE stream: {}", result);
        }

        return ResponseEntity.accepted().body("Callback received");
    }

    private long parseLastEventId(String lastEventId) {
        return Optional.ofNullable(lastEventId)
                .map(id -> {
                    try {
                        return Long.parseLong(id);
                    } catch (NumberFormatException e) {
                        return 0L;
                    }
                })
                .orElse(0L);
    }

}


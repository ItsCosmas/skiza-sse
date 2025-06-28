package dev.cozy.skizasse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

@WebFluxTest(controllers = PostbackController.class)
class PostbackControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void testReceivePostback() {
        String body = "Test postback data";

        webTestClient.post()
                .uri("/api/postbacks")
                .contentType(MediaType.TEXT_PLAIN)
                .bodyValue(body)
                .exchange()
                .expectStatus().isAccepted()
                .expectBody(String.class)
                .isEqualTo("Callback received");
    }

    @Test
    void testStreamPostbacksReturnsSSE() {
        Flux<String> eventFlux = webTestClient.get()
                .uri("/api/postbacks/stream")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .returnResult(String.class)
                .getResponseBody()
                .take(1);

        StepVerifier.create(eventFlux)
                .expectNextCount(1) // At least 1 event
                .thenCancel()
                .verify();
    }

    @Test
    void testStreamEmitsPostbackEvent() {
        // Post a new event
        webTestClient.post()
                .uri("/api/postbacks")
                .contentType(MediaType.TEXT_PLAIN)
                .bodyValue("{ \"msg\": \"Hello\" }")
                .exchange()
                .expectStatus().isAccepted();

        // Stream and expect the message
        Flux<String> eventFlux = webTestClient.get()
                .uri("/api/postbacks/stream")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .returnResult(String.class)
                .getResponseBody()
                .filter(event -> event.contains("Hello")) // Ignore heartbeat
                .timeout(Duration.ofSeconds(5));

        StepVerifier.create(eventFlux)
                .expectNextMatches(event -> event.contains("Hello"))
                .thenCancel()
                .verify();
    }
}

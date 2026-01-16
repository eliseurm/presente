package br.eng.eliseu.presente.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class WhatsAppService {
    private static final String ACCESS_TOKEN = "SEU_TOKEN_AQUI";
    private static final String PHONE_NUMBER_ID = "SEU_ID_AQUI";

    public void enviarMensagem(String telefoneFuncionario, String nomeTemplate) throws Exception {
        String jsonPayload = "{"
                + "\"messaging_product\": \"whatsapp\","
                + "\"to\": \"" + telefoneFuncionario + "\","
                + "\"type\": \"template\","
                + "\"template\": { \"name\": \"" + nomeTemplate + "\", \"language\": { \"code\": \"pt_BR\" } }"
                + "}";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://graph.facebook.com/v18.0/" + PHONE_NUMBER_ID + "/messages"))
                .header("Authorization", "Bearer " + ACCESS_TOKEN)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Status: " + response.statusCode());
        System.out.println("Resposta: " + response.body());
    }
}

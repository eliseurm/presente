package br.eng.eliseu.presente.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

public class WhatsAppService {

    // Configurações da sua conta Meta (Pegue no Painel do Desenvolvedor)
    private static final String ACCESS_TOKEN = "SEU_TOKEN_PERMANENTE_AQUI";
    private static final String PHONE_NUMBER_ID = "SEU_PHONE_NUMBER_ID_AQUI";
    private static final String API_URL = "https://graph.facebook.com/v18.0/" + PHONE_NUMBER_ID + "/messages";

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


/*
    public static void main(String[] args) {
        // Exemplo de dados: Em um cenário real, você buscaria do seu Banco de Dados (JDBC/JPA)
        List<Map<String, String>> funcionarios = List.of(
                Map.of("nome", "Joao Silva", "telefone", "5511999999999", "link", "https://prefeitura.gov/p?t=123"),
                Map.of("nome", "Maria Souza", "telefone", "5511888888888", "link", "https://prefeitura.gov/p?t=456")
        );

        DisparadorWhatsApp app = new DisparadorWhatsApp();
        app.processarEnvios(funcionarios);
    }
*/

    public void processarEnvios(List<Map<String, String>> lista) {
        HttpClient client = HttpClient.newHttpClient();

        for (Map<String, String> func : lista) {
            try {
                String payload = montarPayloadJson(func.get("telefone"), func.get("nome"), func.get("link"));

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(API_URL))
                        .header("Authorization", "Bearer " + ACCESS_TOKEN)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload))
                        .build();

                // Envio síncrono para teste (Para 2.000, recomendo usar sendAsync)
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                System.out.println("Funcionario: " + func.get("nome") + " | Status: " + response.statusCode());

                // IMPORTANTE: Pequeno delay para respeitar limites de taxa se necessário
                Thread.sleep(100);

            } catch (Exception e) {
                System.err.println("Erro ao enviar para " + func.get("nome") + ": " + e.getMessage());
            }
        }
    }

    private String montarPayloadJson(String telefone, String nome, String linkMagico) {
        // Estrutura exigida pela API da Meta para Templates com Variáveis
        return "{"
                + "\"messaging_product\": \"whatsapp\","
                + "\"to\": \"" + telefone + "\","
                + "\"type\": \"template\","
                + "\"template\": {"
                + "\"name\": \"escolha_presente_funcionario\","
                + "\"language\": { \"code\": \"pt_BR\" },"
                + "\"components\": ["
                + "{"
                + "\"type\": \"body\","
                + "\"parameters\": ["
                + "{\"type\": \"text\", \"text\": \"" + nome + "\"},"
                + "{\"type\": \"text\", \"text\": \"" + linkMagico + "\"}"
                + "]"
                + "}"
                + "]"
                + "}"
                + "}";
    }
}

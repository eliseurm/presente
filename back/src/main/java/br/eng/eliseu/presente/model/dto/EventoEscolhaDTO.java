package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.EventoEscolha;
import br.eng.eliseu.presente.model.StatusEnum;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoEscolhaDTO {

    private Long id;

    private LocalDateTime dataEscolha;
    private LocalDateTime alteradoEm;
    private StatusEnum status;

    // --- Informações de Evento ---
    private Long eventoId;
    private String eventoNome;
    private StatusEnum eventoStatus;

    // --- Informações de Pessoa ---
    private Long pessoaId;
    private String pessoaNome;
    private String pessoaTelefone;
    private String pessoaEmail;

    // --- Informações de Produto ---
    private Long produtoId;
    private String produtoNome;
    private String produtoDescricao;
    private Boolean produtoStatus;

    // --- Informações de Cor ---
    private Long corId;
    private String corNome;
    private String corHex;

    // --- Informações de Tamanho ---
    private Long tamanhoId;
    private String tamanhoDescricao;
    private String tamanhoTipoProduto;

    // Método Estático de Fábrica
    public static EventoEscolhaDTO fromEntity(EventoEscolha escolha) {
        if (escolha == null) return null;

        return EventoEscolhaDTO.builder()
                // Campos de EventoEscolha
                .id(escolha.getId())
                .dataEscolha(escolha.getDataEscolha())
                .alteradoEm(escolha.getAlteradoEm())
                .status(escolha.getStatus())

                // Informações de Evento
                .eventoId(escolha.getEvento() != null ? escolha.getEvento().getId() : null)
                .eventoNome(escolha.getEvento() != null ? escolha.getEvento().getNome() : null)
                .eventoStatus(escolha.getEvento() != null ? escolha.getEvento().getStatus() : null)

                // Informações de Pessoa
                .pessoaId(escolha.getPessoa() != null ? escolha.getPessoa().getId() : null)
                .pessoaNome(escolha.getPessoa() != null ? escolha.getPessoa().getNome() : null)
                .pessoaTelefone(escolha.getPessoa() != null ? escolha.getPessoa().getTelefone() : null)
                .pessoaEmail(escolha.getPessoa() != null ? escolha.getPessoa().getEmail() : null)

                // Informações de Produto
                .produtoId(escolha.getProduto() != null ? escolha.getProduto().getId() : null)
                .produtoNome(escolha.getProduto() != null ? escolha.getProduto().getNome() : null)
                .produtoDescricao(escolha.getProduto() != null ? escolha.getProduto().getDescricao() : null)
                .produtoStatus(escolha.getProduto() != null ? escolha.getProduto().getStatus() : null)

                // Informações de Cor
                .corId(escolha.getCor() != null ? escolha.getCor().getId() : null)
                .corNome(escolha.getCor() != null ? escolha.getCor().getNome() : null)
                .corHex(escolha.getCor() != null ? escolha.getCor().getCorHex() : null)

                // Informações de Tamanho
                .tamanhoId(escolha.getTamanho() != null ? escolha.getTamanho().getId() : null)
                .tamanhoDescricao(escolha.getTamanho() != null ? escolha.getTamanho().getTamanho() : null)
                .tamanhoTipoProduto(escolha.getTamanho() != null && escolha.getTamanho().getTipo() != null ?
                        escolha.getTamanho().getTipo().name() : null)
                .build();
    }
}
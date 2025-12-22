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
public class EventoEscolhaDto {

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
    private StatusEnum produtoStatus;

    // --- Informações de Cor ---
    private Long corId;
    private String corNome;
    private String corHex;

    // --- Informações de Tamanho ---
    private Long tamanhoId;
    private String tamanhoDescricao;
    private String tamanhoTipoProduto;

}
package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.EventoEscolha;
import br.eng.eliseu.presente.model.dto.EventoEscolhaDto;

public class EventoEscolhaMapper {

    public static EventoEscolhaDto toDto(EventoEscolha escolha) {
        if (escolha == null) return null;

        return EventoEscolhaDto.builder()
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

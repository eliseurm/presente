package br.eng.eliseu.presente.model.dto;

import br.eng.eliseu.presente.model.ProdutoTipoEnum;
import jakarta.persistence.*;

public record TamanhoDto(
        Long id,
        ProdutoTipoEnum tipo,
        String tamanho,
        Long version
) {
}

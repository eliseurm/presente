package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Produto;
import br.eng.eliseu.presente.model.ProdutoEstoque;
import br.eng.eliseu.presente.model.dto.ProdutoEstoqueDto;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProdutoEstoqueMapper {

    // --- Métodos Públicos Principais ---

    public static ProdutoEstoqueDto toDto(ProdutoEstoque entity) {
        if (entity == null) return null;

        return new ProdutoEstoqueDto(
                entity.getId(),
                entity.getProduto() != null ? entity.getProduto().getId() : null,
                CorMapper.toDto(entity.getCor()),
                TamanhoMapper.toDto(entity.getTamanho()),
                entity.getPreco(),
                entity.getQuantidade(),
                entity.getStatus(),
                entity.getVersion()
        );
    }

    public static ProdutoEstoque fromDto(ProdutoEstoqueDto dto) {
        if (dto == null) return null;

        ProdutoEstoque entity = new ProdutoEstoque();
        entity.setId(dto.id());

        // Mapeia o ID do produto para uma referência de entidade
        if (dto.produtoId() != null) {
            Produto p = new Produto();
            p.setId(dto.produtoId());
            entity.setProduto(p);
        }

        entity.setCor(CorMapper.fromDto(dto.cor()));
        entity.setTamanho(TamanhoMapper.fromDto(dto.tamanho()));
        entity.setPreco(dto.preco());
        entity.setQuantidade(dto.quantidade());
        entity.setStatus(dto.status());
        entity.setVersion(dto.version());

        return entity;
    }

    public static List<ProdutoEstoqueDto> toDtoList(List<ProdutoEstoque> list) {
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream()
                .map(ProdutoEstoqueMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<ProdutoEstoque> fromDtoList(List<ProdutoEstoqueDto> list) {
        if (list == null || list.isEmpty()) return Collections.emptyList();
        return list.stream()
                .map(ProdutoEstoqueMapper::fromDto)
                .collect(Collectors.toList());
    }

}
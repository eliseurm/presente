package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Imagem;
import br.eng.eliseu.presente.model.Produto;
import br.eng.eliseu.presente.model.dto.*;
import br.eng.eliseu.presente.model.ProdutoEstoque; // Import necessário

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ProdutoMapper {

    // Método principal de conversão de entidade para DTO (Resumido/Lista)
    public static ProdutoDto toDto(Produto p) {
        if (p == null) return null;

        return new ProdutoDto(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                p.getPreco(),
                p.getStatus(),
                p.getCriadoEm(),
                p.getAlteradoEm(),
                null, // Listas nulas na visualização simples
                null,
                p.getVersion()
        );
    }

    // Método Completo (Detalhe)
    public static ProdutoCompletoDto toDtoCompleto(Produto produto) {
        if (produto == null) return null;

        List<ProdutoEstoqueDto> estoquesDto = ProdutoEstoqueMapper.toDtoList(produto.getEstoques());

        List<ImagemDto> imagensDto = produto.getImagens() == null ? Collections.emptyList() :
                produto.getImagens().stream()
                        .map(imagem -> new ImagemDto(
                                imagem.getId(),
                                imagem.getNome(),
                                imagem.getUrl(),
                                imagem.getArquivo(),
                                imagem.getCriadoEm(),
                                imagem.getAlteradoEm(),
                                imagem.getVersion()
                        ))
                        .collect(Collectors.toList());

        return new ProdutoCompletoDto(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getStatus(),
                produto.getCriadoEm(),
                produto.getAlteradoEm(),
                estoquesDto,
                imagensDto,
                produto.getVersion()
        );
    }

    public static Produto fromDto(ProdutoDto dto) {
        if (dto == null) return null;

        Produto produto = new Produto();
        produto.setId(dto.id());
        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPreco(dto.preco());
        produto.setStatus(dto.status());
        produto.setCriadoEm(dto.criadoEm());
        produto.setAlteradoEm(dto.alteradoEm());
        produto.setVersion(dto.version());

        if (dto.estoques() != null) {
            List<ProdutoEstoque> estoques = ProdutoEstoqueMapper.fromDtoList(dto.estoques());
            estoques.forEach(e -> e.setProduto(produto));
            produto.setEstoques(estoques);
        }

        if (dto.imagens() != null) {
            produto.setImagens(mapImagensFromDto(dto.imagens()));
        }

        return produto;
    }

    // --- NOVO MÉTODO IMPLEMENTADO ---
    public static Produto fromDtoCompleto(ProdutoCompletoDto dto) {
        if (dto == null) return null;

        Produto produto = new Produto();
        produto.setId(dto.id());
        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPreco(dto.preco());
        produto.setStatus(dto.status());
        produto.setCriadoEm(dto.criadoEm());
        produto.setAlteradoEm(dto.alteradoEm());
        produto.setVersion(dto.version());

        // 1. Mapeamento de Estoque
        if (dto.estoques() != null) {
            List<ProdutoEstoque> estoques = ProdutoEstoqueMapper.fromDtoList(dto.estoques());
            // CRUCIAL: Vincular o Pai (Produto) aos Filhos (Estoque) para o Cascade funcionar
            estoques.forEach(e -> e.setProduto(produto));
            produto.setEstoques(estoques);
        }

        // 2. Mapeamento das Imagens
        if (dto.imagens() != null) {
            produto.setImagens(mapImagensFromDto(dto.imagens()));
        }

        return produto;
    }

    // Método auxiliar para evitar duplicação de código no mapeamento de imagens
    private static List<Imagem> mapImagensFromDto(List<ImagemDto> imagensDto) {
        return imagensDto.stream()
                .map(imgDto -> {
                    Imagem imagem = new Imagem();
                    imagem.setId(imgDto.id());
                    imagem.setNome(imgDto.nome());
                    imagem.setUrl(imgDto.url());
                    imagem.setArquivo(imgDto.arquivo());
                    imagem.setCriadoEm(imgDto.criadoEm());
                    imagem.setAlteradoEm(imgDto.alteradoEm());
                    return imagem;
                }).collect(Collectors.toList());
    }

    public static List<ProdutoDto> toDtoList(List<Produto> produtos) {
        if (produtos == null) return Collections.emptyList();
        return produtos.stream()
                .map(ProdutoMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<ProdutoCompletoDto> toDtoListCompleto(List<Produto> produtos) {
        if (produtos == null) return Collections.emptyList();
        return produtos.stream()
                .map(ProdutoMapper::toDtoCompleto)
                .collect(Collectors.toList());
    }
}
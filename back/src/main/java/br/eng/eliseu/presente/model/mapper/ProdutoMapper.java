package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Produto;
import br.eng.eliseu.presente.model.dto.CorDto;
import br.eng.eliseu.presente.model.dto.ImagemDto;
import br.eng.eliseu.presente.model.dto.ProdutoDto;
import br.eng.eliseu.presente.model.dto.TamanhoDto;

import java.util.List;
import java.util.stream.Collectors;

public class ProdutoMapper {

    // Método para converter a lista
    public static List<ProdutoDto> toDtoList(List<Produto> produtos) {
        return produtos.stream()
                .map(ProdutoMapper::toDto)
                .collect(Collectors.toList());
    }

    // Método principal de conversão de entidade para DTO
    public static ProdutoDto toDto(Produto produto) {
        // Mapeamento manual das coleções internas (essencial para carregar os LAZY)
        List<CorDto> coresDto = produto.getCores().stream()
                .map(cor -> new CorDto(
                        cor.getId(),
                        cor.getNome(),
                        cor.getCorHex(),
                        cor.getCorRgbA()
                ))
                .collect(Collectors.toList());

        List<TamanhoDto> tamanhosDto = produto.getTamanhos().stream()
                .map(tamanho -> new TamanhoDto(
                        tamanho.getId(),
                        tamanho.getTipo(),
                        tamanho.getTamanho(),
                        tamanho.getVersion()
                ))
                .collect(Collectors.toList());

        // Mapeamento manual das imagens
        List<ImagemDto> imagensDto = produto.getImagens().stream()
                .map(imagem -> new ImagemDto(
                        imagem.getId(),
                        imagem.getNome(),
                        imagem.getUrl(),
                        imagem.getArquivo(),
                        imagem.getCriadoEm(),
                        imagem.getAlteradoEm()
                ))
                .collect(Collectors.toList());

        // Criação do ProdutoDto principal
        return new ProdutoDto(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getStatus(),
                tamanhosDto,
                coresDto,
                imagensDto,
                produto.getCriadoEm(),
                produto.getAlteradoEm()
        );
    }
}

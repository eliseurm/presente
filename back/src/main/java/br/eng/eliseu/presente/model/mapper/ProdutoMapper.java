package br.eng.eliseu.presente.model.mapper;

import br.eng.eliseu.presente.model.Cor;
import br.eng.eliseu.presente.model.Imagem;
import br.eng.eliseu.presente.model.Produto;
import br.eng.eliseu.presente.model.Tamanho;
import br.eng.eliseu.presente.model.dto.*;

import java.util.List;
import java.util.stream.Collectors;

public class ProdutoMapper {

    // Método principal de conversão de entidade para DTO
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
                null, null, null
        );
    }

    public static ProdutoCompletoDto toDtoCompleto(Produto produto) {

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
        return new ProdutoCompletoDto(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getStatus(),
                produto.getCriadoEm(),
                produto.getAlteradoEm(),
                tamanhosDto,
                coresDto,
                imagensDto
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

        // Mapeamento das Cores
        if (dto.cores() != null) {
            List<Cor> cores = dto.cores().stream()
                    .map(corDto -> {
                        Cor cor = new Cor();
                        cor.setId(corDto.id());
                        cor.setNome(corDto.nome());
                        cor.setCorHex(corDto.corHex());
                        cor.setCorRgbA(corDto.corRgbA());
                        return cor;
                    }).collect(Collectors.toList());
            produto.setCores(cores);
        }

        // Mapeamento dos Tamanhos
        if (dto.tamanhos() != null) {
            List<Tamanho> tamanhos = dto.tamanhos().stream()
                    .map(tamanhoDto -> {
                        Tamanho tamanho = new Tamanho();
                        tamanho.setId(tamanhoDto.id());
                        tamanho.setTipo(tamanhoDto.tipo());
                        tamanho.setTamanho(tamanhoDto.tamanho());
                        tamanho.setVersion(tamanhoDto.version());
                        return tamanho;
                    }).collect(Collectors.toList());
            produto.setTamanhos(tamanhos);
        }

        // Mapeamento das Imagens
        if (dto.imagens() != null) {
            List<Imagem> imagens = dto.imagens().stream()
                    .map(imgDto -> {
                        Imagem imagem = new Imagem();
                        imagem.setId(imgDto.id());
                        imagem.setNome(imgDto.nome());
                        imagem.setUrl(imgDto.url());
                        imagem.setArquivo(imgDto.arquivo());
                        imagem.setCriadoEm(imgDto.criadoEm());
                        imagem.setAlteradoEm(imgDto.alteradoEm());
                        // Opcional: imagem.setProduto(produto); // Se for bidirecional
                        return imagem;
                    }).collect(Collectors.toList());
            produto.setImagens(imagens);
        }

        return produto;
    }

    // Método para converter a lista
    public static List<ProdutoDto> toDtoList(List<Produto> produtos) {
        return produtos.stream()
                .map(ProdutoMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<ProdutoCompletoDto> toDtoListCompleto(List<Produto> produtos) {
        return produtos.stream()
                .map(ProdutoMapper::toDtoCompleto)
                .collect(Collectors.toList());
    }

    public static List<Produto> fromDtoList(List<ProdutoDto> dtos) {
        if (dtos == null) return null;
        return dtos.stream()
                .map(ProdutoMapper::fromDto)
                .collect(Collectors.toList());
    }

}

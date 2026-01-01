package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.dto.ProdutoCompletoDto;
import br.eng.eliseu.presente.model.dto.ProdutoDto;
import br.eng.eliseu.presente.model.filter.ProdutoFilter;
import br.eng.eliseu.presente.model.mapper.ProdutoMapper;
import br.eng.eliseu.presente.repository.ProdutoRepository;
import br.eng.eliseu.presente.service.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/produto")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;
    private final ProdutoRepository produtoRepository;

    @GetMapping
    public ResponseEntity<Page<ProdutoDto>> listar(ProdutoFilter filtro) {

        Page<Produto> pageEntity = produtoService.listar(filtro);

        Page<ProdutoDto> pageDto = pageEntity.map(ProdutoMapper::toDto);

        return ResponseEntity.ok(pageDto);

    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoCompletoDto> buscarPorId(@PathVariable Long id) {
        return produtoService.buscarPorId(id)
                .map(p -> {
                    ProdutoCompletoDto dto = ProdutoMapper.toDtoCompleto(p);
                    return dto;
                }) // Converte a Entidade para o DTO Completo
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Produto> criar(@RequestBody ProdutoDto produtoDto) {

        Produto produto = ProdutoMapper.fromDto(produtoDto);

        return ResponseEntity.ok(produtoService.criar(produto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoCompletoDto> atualizar(@PathVariable Long id, @RequestBody ProdutoCompletoDto dto) {
        try {
            Produto produto = ProdutoMapper.fromDtoCompleto(dto);
            Produto atualizado = produtoService.atualizar(id, produto);
            dto = ProdutoMapper.toDtoCompleto(atualizado);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            produtoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = produtoService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of(
                "total", ids.size(),
                "deletados", deletados
        ));
    }

    @GetMapping("/{id}/imagem/list")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Imagem>> getProdutoImagem(@PathVariable("id") Long produtoId) {

        List<Imagem> imagens = produtoRepository.findImagensByProdutoId(produtoId);

        if (imagens.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(imagens);
    }


}

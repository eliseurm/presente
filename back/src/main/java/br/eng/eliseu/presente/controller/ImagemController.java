package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Imagem;
import br.eng.eliseu.presente.model.filter.ImagemFilter;
import br.eng.eliseu.presente.service.ImagemService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/imagem")
@RequiredArgsConstructor
public class ImagemController {

    private final ImagemService imagemService;

    @GetMapping
    public ResponseEntity<Page<Imagem>> listar(ImagemFilter filtro) {
        return ResponseEntity.ok(imagemService.listar(filtro));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Imagem> buscarPorId(@PathVariable Long id) {
        return imagemService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Imagem> criar(@RequestBody Imagem imagem) {
        return ResponseEntity.ok(imagemService.criar(imagem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Imagem> atualizar(@PathVariable Long id, @RequestBody Imagem imagem) {
        try {
            Imagem atualizado = imagemService.atualizar(id, imagem);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            imagemService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = imagemService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of("total", ids.size(), "deletados", deletados));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Imagem> upload(@RequestPart("file") MultipartFile file,
                                         @RequestPart(value = "nome", required = false) String nome) throws IOException {
        Imagem img = Imagem.builder()
                .nome(nome != null ? nome : file.getOriginalFilename())
                .arquivo(file.getBytes())
                .build();
        Imagem criada = imagemService.criar(img);
        return ResponseEntity.ok(criada);
    }

    @GetMapping("/{id}/arquivo")
    public ResponseEntity<Resource> getArquivo(@PathVariable Long id) {
        return imagemService.buscarPorId(id)
                .map(img -> {
                    byte[] dados = img.getArquivo();
                    if (dados == null) {
                        return ResponseEntity.notFound().<Resource>build();
                    }
                    Resource resource = new ByteArrayResource(dados);
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (img.getNome() != null ? img.getNome() : ("imagem-" + id)) + "\"")
                            .contentType(MediaType.APPLICATION_OCTET_STREAM)
                            .body(resource);
                })
                .orElse(ResponseEntity.notFound().<Resource>build());
    }
}

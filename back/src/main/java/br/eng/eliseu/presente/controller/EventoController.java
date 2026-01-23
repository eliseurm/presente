package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.dto.*;
import br.eng.eliseu.presente.model.filter.EventoFilter;
import br.eng.eliseu.presente.model.filter.EventoPessoaFilter;
import br.eng.eliseu.presente.model.filter.EventoReportFilter;
import br.eng.eliseu.presente.model.mapper.EventoEscolhaMapper;
import br.eng.eliseu.presente.model.mapper.EventoMapper;
import br.eng.eliseu.presente.model.mapper.EventoPessoaMapper;
import br.eng.eliseu.presente.model.mapper.EventoProdutoMapper;
import br.eng.eliseu.presente.repository.EventoEscolhaRepository;
import br.eng.eliseu.presente.repository.EventoProdutoRepository;
import br.eng.eliseu.presente.service.EventoPessoaService;
import br.eng.eliseu.presente.service.EventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/evento")
@RequiredArgsConstructor
public class EventoController {


    private final EventoPessoaMapper eventoPessoaMapper;
    private final EventoProdutoMapper eventoProdutoMapper;
    private final EventoService eventoService;
    private final EventoEscolhaRepository eventoEscolhaRepository;
//    private final EventoPessoaRepository eventoPessoaRepository;
    private final EventoPessoaService eventoPessoaService;
    private final EventoProdutoRepository eventoProdutoRepository;

    public record UpdateStatusRequest(StatusEnum status) {}
    public record AddProdutoRequest(Long produtoId, StatusEnum status) {}
    public record AddERequest(Long produtoId, StatusEnum status) {}
    public record UrlRequest(String baseUrl) {}
    public record EmailRequest(String baseUrl, List<Long> ids) {}




    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or (#filtro != null and #filtro.clienteId != null and @authService.isLinkedToClient(#filtro.clienteId))")
    public ResponseEntity<Page<EventoDto>> listar(@ModelAttribute EventoFilter filtro) {
        // Garante instância não nula para evitar 500 por causa de SpEL/binding
        if (filtro == null) {
            filtro = new EventoFilter();
        }
        return ResponseEntity.ok(eventoService.listarDTO(filtro));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<EventoDto> buscarPorId(@PathVariable Long id, @RequestParam(value = "expand", required = false) String expand) {
        return eventoService.buscarPorIdDTO(id, expand)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or ( #evento != null and #evento.cliente != null and @authService.isLinkedToClient(#evento.cliente.id) )")
    public ResponseEntity<EventoDto> criar(@RequestBody EventoDto evento) {
        return ResponseEntity.ok(eventoService.criarDTO(evento));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<EventoDto> atualizar(@PathVariable Long id, @RequestBody EventoDto dto) {
        try {
            Evento atualizado = eventoService.atualizarEvento(id, EventoMapper.fromDTO(dto));
            return ResponseEntity.ok(EventoMapper.toDTO(atualizado));
        }
        catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            eventoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deletarEmLote(@RequestBody List<Long> ids) {
        int deletados = eventoService.deletarEmLote(ids);
        return ResponseEntity.ok(Map.of(
                "total", ids.size(),
                "deletados", deletados
        ));
    }



    @PostMapping("/{id}/importar-csv")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<ProgressoTarefaDto> importarArquivoCsv(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        ProgressoTarefaDto resultado = eventoService.iniciaImportarArquivoCsv(id, file);
        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/{id}/enviar-emails")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<ProgressoTarefaDto> enviarEmails(@PathVariable Long id, @RequestBody(required = false) EmailRequest req) {
        if(req == null) return ResponseEntity.badRequest().build();

        String baseUrl = req.baseUrl()!=null ? req.baseUrl() : null;
        List<Long> ids = req.ids()!=null ? req.ids() : null;
        ProgressoTarefaDto resultado = eventoService.iniciaEnvioEmails(id, ids, baseUrl);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id}/status-processo")
    public ResponseEntity<ProgressoTarefaDto> getStatusProcesso(@PathVariable Long id) {
        ProgressoTarefaDto p = eventoService.getStatusProgresso(id);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/{id}/parar-processo")
    public ResponseEntity<ProgressoTarefaDto> pararProcesso(@PathVariable Long id) {
        ProgressoTarefaDto p = eventoService.pararProgresso(id);
        return ResponseEntity.ok(p);
    }



    @PostMapping("/{eventoId}/eventoPessoaList")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<Page<EventoPessoaDto>> listEventoPessoaPaginado(@PathVariable("eventoId") Long eventoId, @RequestBody EventoPessoaFilter filtro ) {
        // garanto que o id do evento e o que veio no path
        filtro.setEventoId(eventoId);
        return ResponseEntity.ok(eventoService.listEventoPessoasPaginado(filtro));
    }

    @PostMapping("/{eventoId}/eventoPessoa")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<EventoPessoaDto> adicionarOuAtualizarPessoa(@PathVariable("eventoId") Long eventoId, @RequestBody EventoPessoaDto dto) {
        if (dto == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            EventoPessoa ep = eventoService.addOrUpdateEventoPessoa(eventoId, dto);
            dto = EventoPessoaMapper.toDto(ep);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/pessoas/{eventoPessoaId}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<EventoPessoa> atualizarStatusPessoa(@PathVariable("id") Long eventoId, @PathVariable Long eventoPessoaId, @RequestBody UpdateStatusRequest req) {
        if (req == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(eventoService.updatePessoaVinculo(eventoId, eventoPessoaId, req.status()));
    }

    @DeleteMapping("/{id}/eventoPessoaDeleteLota")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Map<String, Object>> removerPessoa(@PathVariable("id") Long eventoId, @RequestBody List<Long> eventoPessoaIdList) {
        int deletados = eventoPessoaService.deletarEmLote(eventoPessoaIdList);
        return ResponseEntity.ok(Map.of(
                "total", eventoPessoaIdList.size(),
                "deletados", deletados
        ));

    }



    @PostMapping("/{id}/produtos")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<EventoProduto> adicionarOuAtualizarProduto(@PathVariable("id") Long eventoId, @RequestBody AddProdutoRequest req) {
        if (req == null || req.produtoId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(eventoService.addOrUpdateProduto(eventoId, req.produtoId(), req.status()));
    }

    @PutMapping("/{id}/produtos/{eventoProdutoId}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<EventoProduto> atualizarStatusProduto(@PathVariable("id") Long eventoId, @PathVariable Long eventoProdutoId, @RequestBody UpdateStatusRequest req) {
        if (req == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(eventoService.updateProdutoVinculo(eventoId, eventoProdutoId, req.status()));
    }

    @DeleteMapping("/{id}/produtos/{eventoProdutoId}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#eventoId)")
    public ResponseEntity<Void> removerProduto(@PathVariable("id") Long eventoId, @PathVariable Long eventoProdutoId) {
        eventoService.removeProdutoVinculo(eventoId, eventoProdutoId);
        return ResponseEntity.noContent().build();
    }



    @PostMapping("/{id}/iniciar")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<Map<String, Object>> iniciar(@PathVariable("id") Long id, @RequestBody(required = false) UrlRequest req) {
        String baseUrl = req != null ? req.baseUrl() : null;
        return ResponseEntity.ok(eventoService.iniciarEvento(id, baseUrl));
    }

    @PostMapping("/{id}/pausar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> pausar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(eventoService.pausarEvento(id));
    }

    @PostMapping("/{id}/parar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventoDto> parar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(eventoService.pararEvento(id));
    }



    @GetMapping("/{id}/pessoas/{pessoaId}/escolha/ultima")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<EventoEscolha> obterUltimaEscolha(@PathVariable("id") Long eventoId, @PathVariable Long pessoaId) {
        return eventoEscolhaRepository
                .findTopByEvento_IdAndPessoa_IdOrderByDataEscolhaDesc(eventoId, pessoaId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}/pessoas/{pessoaId}/escolha/historico")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    public ResponseEntity<List<EventoEscolhaDto>> obterHistoricoAnterior(@PathVariable("id") Long eventoId, @PathVariable Long pessoaId) {

        List<EventoEscolha> encerradas = eventoEscolhaRepository.findByEvento_IdAndPessoa_IdAndStatusOrderByDataEscolhaDesc(eventoId, pessoaId, StatusEnum.PAUSADO);

        List<EventoEscolhaDto> anteriores = Optional.ofNullable(encerradas)
                // Se 'encerradas' não for nula, cria um Stream a partir dela.
                .orElseGet(Collections::emptyList) // Se 'escolhas' for nula, retorna uma lista vazia imutável.
                .stream()
                .map(EventoEscolhaMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(anteriores);
    }

    @GetMapping("/{id}/pessoas/list")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    @Transactional(readOnly = true)
    public ResponseEntity<List<EventoPessoaDto>> getEventoPessoa(@PathVariable("id") Long eventoId) {

        List<EventoPessoa> entidade = eventoPessoaService.buscaEventoPessoaList(eventoId);

        Set<Long> pessoasQueJaEscolheram = Optional
                .ofNullable(eventoEscolhaRepository.findByEvento_IdAndStatus(eventoId, StatusEnum.ATIVO))
                .orElseGet(List::of)
                .stream()
                .map(ev -> ev.getPessoa() != null ? ev.getPessoa().getId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<EventoPessoaDto> dto = eventoPessoaMapper.toDtoList(entidade, pessoasQueJaEscolheram);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/produtos/list")
    @PreAuthorize("hasRole('ADMIN') or @authService.isLinkedToClientByEventoId(#id)")
    @Transactional(readOnly = true)
    public ResponseEntity<List<EventoProdutoDto>> getEventoProduto(@PathVariable("id") Long eventoId) {

        List<EventoProduto> entidade = eventoProdutoRepository.findByEvento_Id(eventoId);

        List<EventoProdutoDto> dto = eventoProdutoMapper.toDtoList(entidade);

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/relatorio/pdf")
    public ResponseEntity<byte[]> gerarRelatorio(@RequestBody EventoReportFilter filter) {
        try {
            byte[] pdfBytes = eventoService.geraRelatorioEventoPessoa(filter);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename="+filter.getNomeArquivo())
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }


}

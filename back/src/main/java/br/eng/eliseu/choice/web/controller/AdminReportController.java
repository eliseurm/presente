package br.eng.eliseu.choice.web.controller;

import br.eng.eliseu.choice.repository.PessoaRepository;
import br.eng.eliseu.choice.repository.ProdutoRepository;
import br.eng.eliseu.choice.repository.SelecionadoRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/report")
public class AdminReportController {

    private final ProdutoRepository productRepo;
    private final PessoaRepository personRepo;
    private final SelecionadoRepository selectionRepo;

    public AdminReportController(ProdutoRepository productRepo, PessoaRepository personRepo, SelecionadoRepository selectionRepo) {
        this.productRepo = productRepo;
        this.personRepo = personRepo;
        this.selectionRepo = selectionRepo;
    }

/*
    @GetMapping("/summary")
    public List<Map<String, Object>> summary(){
        List<Produto> produtos = productRepo.findByActiveTrueOrderByNameAsc();
        Map<Long, Integer> counts = new HashMap<>();
        for(Selecionado s: selectionRepo.findAll()){
            for(SelecionadoItem i: s.getItems()){
                counts.merge(i.getProduto().getId(), i.getQuantity(), Integer::sum);
            }
        }
        return produtos.stream().map(p -> Map.<String,Object>of(
                "id", p.getId(),
                "name", p.getNome(),
                "total", counts.getOrDefault(p.getId(), 0)
        )).collect(Collectors.toList());
    }

    @GetMapping(value="/export.csv")
    public ResponseEntity<byte[]> exportCsv(){
        StringBuilder sb = new StringBuilder();
        sb.append("Pessoa;Produto;Quantidade\n");
        List<Selecionado> selecionados = selectionRepo.findAll();
        for(Selecionado s : selecionados){
            String personName = s.getPessoa().getNome();
            for(SelecionadoItem i : s.getItems()){
                sb.append(personName).append(';')
                  .append(i.getProduto().getNome()).append(';')
                  .append(i.getQuantity()).append('\n');
            }
        }
        byte[] data = sb.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }
*/

}

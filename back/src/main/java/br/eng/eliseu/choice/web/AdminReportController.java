package br.eng.eliseu.choice.web;

import br.eng.eliseu.choice.model.Person;
import br.eng.eliseu.choice.model.Product;
import br.eng.eliseu.choice.model.Selection;
import br.eng.eliseu.choice.model.SelectionItem;
import br.eng.eliseu.choice.repo.PersonRepository;
import br.eng.eliseu.choice.repo.ProductRepository;
import br.eng.eliseu.choice.repo.SelectionRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/report")
public class AdminReportController {

    private final ProductRepository productRepo;
    private final PersonRepository personRepo;
    private final SelectionRepository selectionRepo;

    public AdminReportController(ProductRepository productRepo, PersonRepository personRepo, SelectionRepository selectionRepo) {
        this.productRepo = productRepo;
        this.personRepo = personRepo;
        this.selectionRepo = selectionRepo;
    }

    @GetMapping("/summary")
    public List<Map<String, Object>> summary(){
        List<Product> products = productRepo.findByActiveTrueOrderByNameAsc();
        Map<Long, Integer> counts = new HashMap<>();
        for(Selection s: selectionRepo.findAll()){
            for(SelectionItem i: s.getItems()){
                counts.merge(i.getProduct().getId(), i.getQuantity(), Integer::sum);
            }
        }
        return products.stream().map(p -> Map.<String,Object>of(
                "id", p.getId(),
                "name", p.getName(),
                "total", counts.getOrDefault(p.getId(), 0)
        )).collect(Collectors.toList());
    }

    @GetMapping(value="/export.csv")
    public ResponseEntity<byte[]> exportCsv(){
        StringBuilder sb = new StringBuilder();
        sb.append("Pessoa;Produto;Quantidade\n");
        List<Selection> selections = selectionRepo.findAll();
        for(Selection s : selections){
            String personName = s.getPerson().getName();
            for(SelectionItem i : s.getItems()){
                sb.append(personName).append(';')
                  .append(i.getProduct().getName()).append(';')
                  .append(i.getQuantity()).append('\n');
            }
        }
        byte[] data = sb.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }
}

package br.eng.eliseu.choice.web.controller;

import br.eng.eliseu.choice.repository.ProdutoRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProdutoController {
    private final ProdutoRepository repo;

    public ProdutoController(ProdutoRepository repo) {
        this.repo = repo;
    }

/*
    @GetMapping
    public List<Produto> list(){
        return repo.findByActiveTrueOrderByNameAsc();
    }
*/
}

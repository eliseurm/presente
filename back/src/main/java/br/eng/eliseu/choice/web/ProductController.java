package br.eng.eliseu.choice.web;

import br.eng.eliseu.choice.model.Product;
import br.eng.eliseu.choice.repo.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductRepository repo;

    public ProductController(ProductRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Product> list(){
        return repo.findByActiveTrueOrderByNameAsc();
    }
}

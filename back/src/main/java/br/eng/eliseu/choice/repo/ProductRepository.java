package br.eng.eliseu.choice.repo;

import br.eng.eliseu.choice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrueOrderByNameAsc();
}

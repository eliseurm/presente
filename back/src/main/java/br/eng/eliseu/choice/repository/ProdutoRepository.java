package br.eng.eliseu.choice.repository;

import br.eng.eliseu.choice.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
}

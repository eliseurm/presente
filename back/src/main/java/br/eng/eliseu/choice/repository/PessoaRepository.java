package br.eng.eliseu.choice.repository;

import br.eng.eliseu.choice.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PessoaRepository extends JpaRepository<Pessoa, Long> {
}

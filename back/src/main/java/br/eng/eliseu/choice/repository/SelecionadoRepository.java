package br.eng.eliseu.choice.repository;

import br.eng.eliseu.choice.model.Pessoa;
import br.eng.eliseu.choice.model.Selecionado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SelecionadoRepository extends JpaRepository<Selecionado, Long> {
    Optional<Selecionado> findByPessoa(Pessoa pessoa);
}

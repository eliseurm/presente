package br.eng.eliseu.choice.repository;

import br.eng.eliseu.choice.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}

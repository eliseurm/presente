package br.eng.eliseu.choice.repository;

import br.eng.eliseu.choice.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {
}

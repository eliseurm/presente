package br.eng.eliseu.choice.repository;

import br.eng.eliseu.choice.model.ChaveMagica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChaveMagicaRepository extends JpaRepository<ChaveMagica, Long> {
    Optional<ChaveMagica> findByTokenLookup(String lookup);
//    List<ChaveMagica> findAllByExpiresAtAfter(LocalDateTime now);
}

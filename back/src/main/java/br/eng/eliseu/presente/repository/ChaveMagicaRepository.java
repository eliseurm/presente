package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.ChaveMagica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChaveMagicaRepository extends JpaRepository<ChaveMagica, Long> {
    Optional<ChaveMagica> findTopByPessoa_IdAndTokenLookupOrderByExpiraEmDesc(Long pessoaId, String tokenLookup);
}

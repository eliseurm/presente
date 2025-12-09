package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.EventoEscolha;
import br.eng.eliseu.presente.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventoEscolhaRepository extends JpaRepository<EventoEscolha, Long>, JpaSpecificationExecutor<EventoEscolha> {

    Optional<EventoEscolha> findTopByEvento_IdAndPessoa_IdOrderByDataEscolhaDesc(Long eventoId, Long pessoaId);

    List<EventoEscolha> findByEvento_IdAndPessoa_IdOrderByDataEscolhaDesc(Long eventoId, Long pessoaId);

    List<EventoEscolha> findByEvento_IdAndPessoa_IdAndStatusOrderByDataEscolhaDesc(Long eventoId, Long pessoaId, StatusEnum status);

}

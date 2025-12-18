package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.EventoEscolha;
import br.eng.eliseu.presente.model.EventoPessoa;
import br.eng.eliseu.presente.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventoPessoaRepository extends JpaRepository<EventoPessoa, Long>, JpaSpecificationExecutor<EventoPessoa> {

    List<EventoPessoa> findByEvento_IdAndStatus(Long eventoId, StatusEnum status);

    List<EventoPessoa> findByEvento_IdAndNomeMagicNumberIsNotNull(Long eventoId);

    Optional<EventoPessoa> findByNomeMagicNumber(String nomeMagicNumber);

    List<EventoPessoa> findByEvento_Id(Long eventoId);
}

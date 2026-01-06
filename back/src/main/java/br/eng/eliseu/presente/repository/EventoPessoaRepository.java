package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.filter.PessoaFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventoPessoaRepository extends JpaRepository<EventoPessoa, Long>, JpaSpecificationExecutor<EventoPessoa> {

    List<EventoPessoa> findByEvento_IdAndStatus(Long eventoId, StatusEnum status);

    List<EventoPessoa> findByEvento_IdAndNomeMagicNumberIsNotNull(Long eventoId);

    Optional<EventoPessoa> findByNomeMagicNumber(String nomeMagicNumber);

    List<EventoPessoa> findByEvento_Id(Long eventoId);

    boolean existsByEventoAndPessoa(Evento evento, Pessoa pessoa);

    @Query("SELECT ep FROM EventoPessoa ep " +
            "WHERE ep.evento.id = :eventoId " +
            "AND (:#{#filtro.nome} IS NULL OR LOWER(ep.pessoa.nome) LIKE LOWER(CONCAT('%', :#{#filtro.nome}, '%'))) " +
            "AND (:#{#filtro.cpf} IS NULL OR ep.pessoa.cpf LIKE CONCAT('%', :#{#filtro.cpf}, '%')) " +
            "AND (:#{#filtro.email} IS NULL OR LOWER(ep.pessoa.email) LIKE LOWER(CONCAT('%', :#{#filtro.email}, '%')))")
    Page<EventoPessoa> buscarPaginado(
            @Param("eventoId") Long eventoId,
            @Param("filtro") PessoaFilter filtro,
            Pageable pageable);
}

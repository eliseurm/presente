package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.filter.EventoPessoaFilter;
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

    @Query("""
        SELECT ep FROM EventoPessoa ep 
        WHERE 1=1 
        and ep.evento.id = :#{#filtro.eventoId}
        AND (:#{#filtro.pessoaNome} IS NULL OR LOWER(ep.pessoa.nome) LIKE LOWER(CONCAT('%', :#{#filtro.pessoaNome}, '%'))) 
        AND (:#{#filtro.pessoaCpf} IS NULL OR ep.pessoa.cpf LIKE CONCAT('%', :#{#filtro.pessoaCpf}, '%')) 
        AND (:#{#filtro.pessoaEmail} IS NULL OR LOWER(ep.pessoa.email) LIKE LOWER(CONCAT('%', :#{#filtro.pessoaEmail}, '%')))
        AND (:#{#filtro.pessoaTelefone} IS NULL OR LOWER(ep.pessoa.telefone) LIKE LOWER(CONCAT('%', :#{#filtro.pessoaTelefone}, '%')))
        """)
    Page<EventoPessoa> buscarPaginado(@Param("filtro") EventoPessoaFilter filtro, Pageable pageable);
}

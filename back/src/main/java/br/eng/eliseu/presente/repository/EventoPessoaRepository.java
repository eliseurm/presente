package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.*;
import br.eng.eliseu.presente.model.filter.EventoPessoaFilter;
import br.eng.eliseu.presente.model.filter.EventoReportFilter;
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
        select ep 
        from EventoPessoa ep 
        where 1=1 
        and ep.evento.id = :#{#filtro.eventoId}
        and (:#{#filtro.pessoaNome} is null or lower(ep.pessoa.nome) like lower(concat('%', :#{#filtro.pessoaNome}, '%'))) 
        and (:#{#filtro.pessoaCpf} is null or ep.pessoa.cpf like concat('%', :#{#filtro.pessoaCpf}, '%')) 
        and (:#{#filtro.pessoaEmail} is null or lower(ep.pessoa.email) like lower(concat('%', :#{#filtro.pessoaEmail}, '%')))
        and (:#{#filtro.pessoaTelefone} is null or lower(ep.pessoa.telefone) like lower(concat('%', :#{#filtro.pessoaTelefone}, '%')))
        """)
    Page<EventoPessoa> buscarPaginado(@Param("filtro") EventoPessoaFilter filtro, Pageable pageable);

    @Query("""
        select ep 
        from EventoPessoa ep 
        join fetch ep.pessoa p 
        where 1=1 
        and ep.evento.id = :#{#filtro.eventoId}
        """)
    List<EventoPessoa> findByEventoIdWithPessoa(@Param("filtro") EventoReportFilter filtro);

}

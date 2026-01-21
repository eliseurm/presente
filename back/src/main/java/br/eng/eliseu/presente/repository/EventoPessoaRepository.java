package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.Evento;
import br.eng.eliseu.presente.model.EventoPessoa;
import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.StatusEnum;
import br.eng.eliseu.presente.model.dto.EventoProdutoConsolidadoDto;
import br.eng.eliseu.presente.model.dto.EventoRelatorioDto;
import br.eng.eliseu.presente.model.filter.EventoPessoaFilter;
import br.eng.eliseu.presente.model.filter.EventoReportFilter;
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

    List<EventoPessoa> findByEventoId(Long eventoId);

    boolean existsByEventoAndPessoa(Evento evento, Pessoa pessoa);

    static final String QUERY_COM_PESSOA = """
        select ep 
        from EventoPessoa ep 
        join fetch ep.pessoa p 
        join fetch p.cliente
        where 1=1 
        and (:#{#filtro.id} is null or ep.id = :#{#filtro.id})
        and (:#{#filtro.eventoId} is null or ep.evento.id = :#{#filtro.eventoId})
        and (:#{#filtro.pessoaNome} is null or lower(ep.pessoa.nome) like lower(concat('%', :#{#filtro.pessoaNome}, '%'))) 
        and (:#{#filtro.pessoaCpf} is null or ep.pessoa.cpf like concat('%', :#{#filtro.pessoaCpf}, '%')) 
        and (:#{#filtro.pessoaEmail} is null or lower(ep.pessoa.email) like lower(concat('%', :#{#filtro.pessoaEmail}, '%')))
        and (:#{#filtro.pessoaTelefone} is null or lower(ep.pessoa.telefone) like lower(concat('%', :#{#filtro.pessoaTelefone}, '%')))
        """;
    @Query(QUERY_COM_PESSOA)
    Page<EventoPessoa> findByEventoIdWithPessoa(@Param("filtro") EventoPessoaFilter filtro, Pageable pageable);

    @Query(QUERY_COM_PESSOA)
    Optional<EventoPessoa> findByIdWithPessoa(@Param("filtro") EventoPessoaFilter filtro);

    @Query("""
            SELECT new br.eng.eliseu.presente.model.dto.EventoRelatorioDto(
            e.nome, e.descricao, e.status, e.inicio, e.fimPrevisto, e.fim,
            p.nome, p.email, p.telefone, p.cpf,
            p.endereco, p.complemento, p.cidade, p.estado, p.cep,
            ep.status, ep.nomeMagicNumber, ep.organoNivel1, ep.organoNivel2, ep.organoNivel3, ep.localTrabalho,
            (es.id IS NOT NULL), 
            es.dataEscolha, prd.nome, prd.preco, tam.tipo, tam.tamanho, cor.nome
            )
            FROM Evento e
            JOIN e.eventoPessoas ep   
            JOIN ep.pessoa p 
            LEFT JOIN EventoEscolha es on es.status = 'ATIVO' AND es.dataEscolha = (SELECT MAX(sub.dataEscolha) FROM EventoEscolha sub WHERE sub.evento = e AND sub.pessoa = p AND sub.status = 'ATIVO')
            LEFT JOIN es.produto prd
            LEFT JOIN es.tamanho tam
            LEFT JOIN es.cor cor
            WHERE 1=1 
            and e.id = :#{#filtro.eventoId}
            and e.cliente.id = :#{#filtro.clienteId}
            AND (:#{#filtro.jaEscolheu} = -1 OR (:#{#filtro.jaEscolheu} = 1 AND es.id IS NOT NULL) OR (:#{#filtro.jaEscolheu} = 0 AND es.id IS NULL))
           """)
    List<EventoRelatorioDto> findByEventoIdWithFilter(@Param("filtro") EventoReportFilter filtro);

    @Query("""
            select new br.eng.eliseu.presente.model.dto.EventoProdutoConsolidadoDto( 
            pr.nome, pr.descricao, pr.preco, c.nome, t.tamanho, count(*) 
            ) 
            from EventoEscolha ee 
            join EventoPessoa ep on ee.evento = ep.evento and ee.pessoa = ep.pessoa
            join ee.evento e 
            join e.cliente cl 
            join ee.produto pr 
            join ee.cor c 
            join ee.tamanho t 
            where 1=1 
            and ee.dataEscolha = (select max(sub.dataEscolha) from EventoEscolha sub where sub.evento = ee.evento and sub.pessoa = ee.pessoa and sub.status = 'ATIVO') 
            and ee.evento.id = :#{#filtro.eventoId} 
            and e.cliente.id = :#{#filtro.clienteId} 
            group by pr.nome, pr.descricao, pr.preco, c.nome, t.tamanho 
            """)
    List<EventoProdutoConsolidadoDto> findByEventoIdProdutosConsolidados(@Param("filtro") EventoReportFilter filtro);

}

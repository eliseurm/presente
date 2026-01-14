package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.Cliente;
import br.eng.eliseu.presente.model.Pessoa;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Optional;
import java.util.List;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, Long>, JpaSpecificationExecutor<Pessoa> {
    Optional<Pessoa> findByEmail(String email);
    Optional<Pessoa> findByTelefone(String telefone);
    Optional<Pessoa> findByEmailOrTelefone(String email, String telefone);

    // Busca leve para ADMIN (por nome/email/telefone)
    @Query("""
        select p from Pessoa p 
        where 1=1
        and (:q is null or :q = '' or lower(p.nome) like concat('%', lower(:q), '%') or lower(p.email) like concat('%', lower(:q), '%') or p.telefone like concat('%', :q, '%'))
            """)
    List<Pessoa> pesquisaAdmin(@Param("q") String q);

    // Pessoas vinculadas a eventos de um cliente específico
    @Query("""
        select distinct p from EventoPessoa ep join ep.pessoa p join ep.evento e 
        where 1=1 
        and e.cliente.id = :clienteId 
        and (:q is null or :q = '' or lower(p.nome) like concat('%', lower(:q), '%') or lower(p.email) like concat('%', lower(:q), '%') or p.telefone like concat('%', :q, '%'))
        """)
    List<Pessoa> pesquisaByCliente(@Param("clienteId") Long clienteId, @Param("q") String q);

    Optional<Pessoa> findByCpf(String cpf);

    List<Pessoa> findByCliente(Cliente cliente);

}
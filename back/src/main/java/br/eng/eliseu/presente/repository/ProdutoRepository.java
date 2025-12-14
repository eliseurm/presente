package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.Evento;
import br.eng.eliseu.presente.model.Produto;
import br.eng.eliseu.presente.model.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {

    @Query("""
        select distinct p 
        from EventoProduto ep 
        join ep.produto p 
        where 1=1 
        and ep.evento = :evento 
        and (ep.status is null or ep.status = :statusEnum)
    """)
    List<Produto> findProdutosComColecoesProntas(Evento evento, StatusEnum statusEnum);
}

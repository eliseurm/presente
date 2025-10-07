package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Produto;
import br.eng.eliseu.presente.model.filter.ProdutoFilter;
import br.eng.eliseu.presente.repository.ProdutoRepository;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService extends AbstractCrudService<Produto, Long, ProdutoFilter> {

    private final ProdutoRepository produtoRepository;

    @Override
    protected ProdutoRepository getRepository() {
        return produtoRepository;
    }

    @Override
    protected JpaSpecificationExecutor<Produto> getSpecificationExecutor() {
        return produtoRepository;
    }

    @Override
    protected Specification<Produto> buildSpecification(ProdutoFilter filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filtro.getNome() != null && !filtro.getNome().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("nome")), "%" + filtro.getNome().toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    protected void prepararParaCriacao(Produto entidade) {
        entidade.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Produto entidade, Produto entidadeExistente) {
        entidadeExistente.setNome(entidade.getNome());
        entidadeExistente.setDescricao(entidade.getDescricao());
        entidadeExistente.setPreco(entidade.getPreco());
        entidadeExistente.setStatus(entidade.getStatus());
        entidadeExistente.setCores(entidade.getCores());
        entidadeExistente.setTamanhos(entidade.getTamanhos());
        entidadeExistente.setImagens(entidade.getImagens());
    }
}

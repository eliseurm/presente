package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Tamanho;
import br.eng.eliseu.presente.model.filter.TamanhoFilter;
import br.eng.eliseu.presente.repository.TamanhoRepository;
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
public class TamanhoService extends AbstractCrudService<Tamanho, Long, TamanhoFilter> {

    private final TamanhoRepository tamanhoRepository;

    @Override
    protected TamanhoRepository getRepository() {
        return tamanhoRepository;
    }

    @Override
    protected JpaSpecificationExecutor<Tamanho> getSpecificationExecutor() {
        return tamanhoRepository;
    }

    @Override
    protected Specification<Tamanho> buildSpecification(TamanhoFilter filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filtro.getTipo() != null) {
                predicates.add(cb.equal(root.get("tipo"), filtro.getTipo()));
            }

            if (filtro.getTamanho() != null && !filtro.getTamanho().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("tamanho")),"%" + filtro.getTamanho().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    protected void prepararParaCriacao(Tamanho entidade) {
        entidade.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long aLong, Tamanho entidade, Tamanho entidadeExistente) {
        // Copia os valores do DTO de entrada para a entidade persistida
        entidadeExistente.setTipo(entidade.getTipo());
        entidadeExistente.setTamanho(entidade.getTamanho());
    }

}
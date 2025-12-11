package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Cor;
import br.eng.eliseu.presente.model.filter.CorFilter;
import br.eng.eliseu.presente.repository.CorRepository;
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
public class CorService extends AbstractCrudService<Cor, Long, CorFilter> {

    private final CorRepository corRepository;

    @Override
    protected CorRepository getRepository() {
        return corRepository;
    }

    @Override
    protected JpaSpecificationExecutor<Cor> getSpecificationExecutor() {
        return corRepository;
    }

    @Override
    protected Specification<Cor> buildSpecification(CorFilter filtro) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filtro.getNome() != null && !filtro.getNome().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("nome")),"%" + filtro.getNome().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

    }

    @Override
    protected void prepararParaCriacao(Cor entidade) {
        entidade.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long aLong, Cor entidade, Cor entidadeExistente) {
        entidadeExistente.setNome(entidade.getNome());
        entidadeExistente.setCorHex(entidade.getCorHex());
        entidadeExistente.setCorRgbA(entidade.getCorRgbA());
    }

}
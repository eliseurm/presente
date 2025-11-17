package br.eng.eliseu.presente.service.api;

import br.eng.eliseu.presente.model.Evento;
import br.eng.eliseu.presente.model.filter.BaseFilter;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
public abstract class AbstractCrudService<T, ID, F extends BaseFilter> implements CrudService<T, ID, F> {

    protected abstract JpaRepository<T, ID> getRepository();
    protected abstract JpaSpecificationExecutor<T> getSpecificationExecutor();
    protected abstract Specification<T> buildSpecification(F filtro);
    protected abstract void prepararParaCriacao(T entidade);
    protected abstract void prepararParaAtualizacao(ID id, T entidade, T entidadeExistente);

    @Override
    public Page<T> listar(F filtro) {

        Sort.Direction sortDirection = filtro.getDirection().equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                filtro.getPage(),
                filtro.getSize(),
                Sort.by(sortDirection, filtro.getSort())
        );

        Specification<T> spec = buildSpecification(filtro);

        return getSpecificationExecutor().findAll(spec, pageable);

    }

    @Override
    public Optional<T> buscarPorId(ID id) {
        return getRepository().findById(id);
    }

    @Override
    public T criar(T entidade) {
        prepararParaCriacao(entidade);
        return getRepository().save(entidade);
    }

    @Override
    public T atualizar(ID id, T entidade) {
        return getRepository().findById(id)
                .map(entidadeExistente -> {
                    prepararParaAtualizacao(id, entidade, entidadeExistente);
                    return getRepository().save(entidadeExistente);
                })
                .orElseThrow(() -> new RuntimeException("Entidade não encontrada com id: " + id));
    }

    @Override
    public void deletar(ID id) {
        if (!getRepository().existsById(id)) {
            throw new RuntimeException("Entidade não encontrada com id: " + id);
        }
        getRepository().deleteById(id);
    }

    @Override
    public int deletarEmLote(List<ID> ids) {
        int deletados = 0;
        for (ID id : ids) {
            if (getRepository().existsById(id)) {
                getRepository().deleteById(id);
                deletados++;
            }
        }
        return deletados;
    }

    protected List<Predicate> buildBasePredicates(F filtro) {
        return new ArrayList<>();
    }
}
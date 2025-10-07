package br.eng.eliseu.presente.service.api;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface CrudService<T, ID, F> {
    Page<T> listar(F filtro);
    Optional<T> buscarPorId(ID id);
    T criar(T entidade);
    T atualizar(ID id, T entidade);
    void deletar(ID id);
    int deletarEmLote(List<ID> ids);
}
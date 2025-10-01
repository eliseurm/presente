package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.filter.PessoaFilter;
import br.eng.eliseu.presente.repository.PessoaRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PessoaService extends AbstractCrudService<Pessoa, Long, PessoaFilter> {

    private final PessoaRepository pessoaRepository;

    @Override
    protected JpaRepository<Pessoa, Long> getRepository() {
        return pessoaRepository;
    }

    @Override
    protected JpaSpecificationExecutor<Pessoa> getSpecificationExecutor() {
        return pessoaRepository;
    }

    @Override
    protected Specification<Pessoa> buildSpecification(PessoaFilter filtro) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filtro.getNome() != null && !filtro.getNome().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("nome")),
                        "%" + filtro.getNome().toLowerCase() + "%"
                ));
            }

            if (filtro.getEmail() != null && !filtro.getEmail().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + filtro.getEmail().toLowerCase() + "%"
                ));
            }

            if (filtro.getTelefone() != null && !filtro.getTelefone().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        root.get("telefone"),
                        "%" + filtro.getTelefone() + "%"
                ));
            }

            if (filtro.getStatus() != null && !filtro.getStatus().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filtro.getStatus()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    protected void prepararParaCriacao(Pessoa entidade) {

        entidade.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Pessoa entidade, Pessoa entidadeExistente) {
        entidade.setId(id);
        entidade.setCriadoEm(entidadeExistente.getCriadoEm());
    }

    // Métodos específicos de negócio podem ser adicionados aqui
    public List<Pessoa> buscarPorStatus(String status) {
        // Lógica específica de negócio
        return pessoaRepository.findAll((root, query, cb) ->
                cb.equal(root.get("status"), status)
        );
    }
}
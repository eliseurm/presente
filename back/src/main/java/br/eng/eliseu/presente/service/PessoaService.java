package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.filter.PessoaFilter;
import br.eng.eliseu.presente.repository.PessoaRepository;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

            if (filtro.getClienteId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("cliente").get("id"), filtro.getClienteId()));
            }

            if (filtro.getNome() != null && !filtro.getNome().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("nome")), "%" + filtro.getNome().toLowerCase() + "%"));
            }

            if (filtro.getCpf() != null && !filtro.getCpf().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.trim(root.get("cpf")), "%" + filtro.getCpf().trim() + "%"));
            }

            if (filtro.getEmail() != null && !filtro.getEmail().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + filtro.getEmail().toLowerCase() + "%"));
            }

            if (filtro.getTelefone() != null && !filtro.getTelefone().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("telefone"), "%" + filtro.getTelefone() + "%"));
            }

            if (filtro.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filtro.getStatus()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    protected void prepararParaCriacao(Pessoa nova) {

        nova.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Pessoa nova, Pessoa existente) {
//        nova.setId(id);
//        nova.setCriadoEm(existente.getCriadoEm());
//        nova.setAlteradoEm(LocalDateTime.now());

        existente.setCliente(nova.getCliente());

        existente.setNome(nova.getNome());
        existente.setCpf(nova.getCpf());
        existente.setEmail(nova.getEmail());
        existente.setTelefone(nova.getTelefone());
        existente.setStatus(nova.getStatus());

        existente.setEndereco(nova.getEndereco());
        existente.setComplemento(nova.getComplemento());
        existente.setCidade(nova.getCidade());
        existente.setEstado(nova.getEstado());
        existente.setCep(nova.getCep());

        existente.setAlteradoEm(LocalDateTime.now());
    }

    // Métodos específicos de negócio podem ser adicionados aqui
    public List<Pessoa> buscarPorStatus(String status) {
        // Lógica específica de negócio
        return pessoaRepository.findAll((root, query, cb) ->
                cb.equal(root.get("status"), status)
        );
    }
}
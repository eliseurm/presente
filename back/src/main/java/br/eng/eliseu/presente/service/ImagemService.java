package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Imagem;
import br.eng.eliseu.presente.model.filter.ImagemFilter;
import br.eng.eliseu.presente.repository.ImagemRepository;
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
public class ImagemService extends AbstractCrudService<Imagem, Long, ImagemFilter> {

    private final ImagemRepository imagemRepository;

    @Override
    protected ImagemRepository getRepository() {
        return imagemRepository;
    }

    @Override
    protected JpaSpecificationExecutor<Imagem> getSpecificationExecutor() {
        return imagemRepository;
    }

    @Override
    protected Specification<Imagem> buildSpecification(ImagemFilter filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filtro.getNome() != null && !filtro.getNome().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("nome")), "%" + filtro.getNome().toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    protected void prepararParaCriacao(Imagem nova) {
        nova.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Imagem nova, Imagem entidadeExistente) {
        entidadeExistente.setNome(nova.getNome());
        entidadeExistente.setUrl(nova.getUrl());
        if (nova.getArquivo() != null && nova.getArquivo().length > 0) {
            entidadeExistente.setArquivo(nova.getArquivo());
        }
    }
}

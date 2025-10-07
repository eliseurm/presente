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
    protected void prepararParaCriacao(Imagem entidade) {
        entidade.setId(null);
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Imagem entidade, Imagem entidadeExistente) {
        entidadeExistente.setNome(entidade.getNome());
        entidadeExistente.setUrl(entidade.getUrl());
        if (entidade.getArquivo() != null && entidade.getArquivo().length > 0) {
            entidadeExistente.setArquivo(entidade.getArquivo());
        }
    }
}

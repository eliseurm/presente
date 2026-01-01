package br.eng.eliseu.presente.service;

import br.eng.eliseu.presente.model.Cor;
import br.eng.eliseu.presente.model.Imagem;
import br.eng.eliseu.presente.model.Produto;
import br.eng.eliseu.presente.model.Tamanho;
import br.eng.eliseu.presente.model.filter.ProdutoFilter;
import br.eng.eliseu.presente.repository.CorRepository;
import br.eng.eliseu.presente.repository.ImagemRepository;
import br.eng.eliseu.presente.repository.ProdutoRepository;
import br.eng.eliseu.presente.repository.TamanhoRepository;
import br.eng.eliseu.presente.service.api.AbstractCrudService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService extends AbstractCrudService<Produto, Long, ProdutoFilter> {

    private final ProdutoRepository produtoRepository;
    private final CorRepository corRepository;
    private final TamanhoRepository tamanhoRepository;
    private final ImagemRepository imagemRepository;

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

    // Garante inicialização das coleções com Open-Session-In-View desabilitado
    @Override
    @Transactional(readOnly = true)
    public Page<Produto> listar(ProdutoFilter filtro) {
        var page = super.listar(filtro);
        page.getContent().forEach(p -> {
            if (p.getImagens() != null) p.getImagens().size();
        });
        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Optional<Produto> buscarPorId(Long id) {
        var opt = super.buscarPorId(id);
        opt.ifPresent(p -> {
            // isto faz o hibernate iniciar a lista que é LAZY
            if (p.getImagens() != null) {
                p.getImagens().size();
            }
            if (p.getEstoques() != null) {
                p.getEstoques().size();
            }
        });
        return opt;
    }

    private void anexarReferencias(Produto entidade) {
        if (entidade == null) return;

        // Normaliza Imagens
        if (entidade.getImagens() != null) {
            var ids = entidade.getImagens().stream()
                    .map(Imagem::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            var managed = ids.isEmpty() ? List.<Imagem>of() : imagemRepository.findAllById(ids);
            entidade.setImagens(managed);
        }
    }

    @Override
    protected void prepararParaCriacao(Produto entidade) {
        entidade.setId(null);
        anexarReferencias(entidade);
    }

    @Override
    protected void prepararParaAtualizacao(Long id, Produto entidade, Produto entidadeExistente) {
        // 1. Carrega referências de imagens (mantém sua lógica atual)
        anexarReferencias(entidade);

        // 2. Atualiza campos simples
        entidadeExistente.setNome(entidade.getNome());
        entidadeExistente.setDescricao(entidade.getDescricao());
        entidadeExistente.setPreco(entidade.getPreco());
        entidadeExistente.setStatus(entidade.getStatus());

        // CORREÇÃO DA VERSÃO (Do problema anterior, mantenha isso!)
        if (entidade.getVersion() != null) {
            entidadeExistente.setVersion(entidade.getVersion());
        }

        // 3. Imagens (ManyToMany geralmente aceita set, mas é bom manter o padrão se der erro depois)
        entidadeExistente.setImagens(entidade.getImagens());

        // --- CORREÇÃO DO ERRO ORPHAN REMOVAL AQUI ---
        // NUNCA faça entidadeExistente.setEstoques(...) se usar orphanRemoval=true.

        if (entidadeExistente.getEstoques() == null) {
            entidadeExistente.setEstoques(new ArrayList<>());
        }

        // A. Limpa a lista atual (O Hibernate agendará os DELETEs dos órfãos)
        entidadeExistente.getEstoques().clear();

        // B. Adiciona os novos itens, garantindo o vínculo com o Pai
        if (entidade.getEstoques() != null) {
            entidade.getEstoques().forEach(item -> {
                // Garante que o filho aponte para o pai gerenciado
                item.setProduto(entidadeExistente);
                // Adiciona na coleção gerenciada existente
                entidadeExistente.getEstoques().add(item);
            });
        }
    }

}

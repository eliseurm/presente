package br.eng.eliseu.choice.service;

import br.eng.eliseu.choice.repository.*;
import org.springframework.stereotype.Service;

@Service
public class SelectionService {

    private final SelecionadoRepository selectionRepo;
    private final PessoaRepository personRepo;
    private final ProdutoRepository productRepo;

    public SelectionService(SelecionadoRepository selectionRepo, PessoaRepository personRepo, ProdutoRepository productRepo) {
        this.selectionRepo = selectionRepo;
        this.personRepo = personRepo;
        this.productRepo = productRepo;
    }

/*
    public SelectionDTO getByPersonId(Long personId){
        Pessoa p = personRepo.findById(personId).orElseThrow();
        return selectionRepo.findByPerson(p)
                .map(sel -> new SelectionDTO(p.getId(), sel.getItems().stream()
                        .map(i -> new SelectionDTO.Item(i.getProduto().getId(), i.getQuantity())).toList()))
                .orElse(new SelectionDTO(p.getId(), List.of()));
    }

    @Transactional
    public SelectionDTO upsert(Long personId, SelectionDTO dto){
        Pessoa p = personRepo.findById(personId).orElseThrow();
        Selecionado sel = selectionRepo.findByPerson(p).orElseGet(() -> {
            Selecionado s = new Selecionado();
            s.setPessoa(p);
            return s;
        });

        sel.getItems().clear();
        List<SelecionadoItem> items = new ArrayList<>();
        for (SelectionDTO.Item it : dto.items()){
            Produto prod = productRepo.findById(it.productId()).orElseThrow();
            SelecionadoItem si = new SelecionadoItem();
            si.setSelecionado(sel);
            si.setProduto(prod);
            si.setQuantity(Math.max(1, it.quantity()));
            items.add(si);
        }
        sel.getItems().addAll(items);
        selectionRepo.save(sel);
        return getByPersonId(personId);
    }
*/

}

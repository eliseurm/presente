package br.eng.eliseu.choice.service;

import br.eng.eliseu.choice.model.*;
import br.eng.eliseu.choice.repo.*;
import br.eng.eliseu.choice.web.dto.SelectionDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SelectionService {

    private final SelectionRepository selectionRepo;
    private final PersonRepository personRepo;
    private final ProductRepository productRepo;

    public SelectionService(SelectionRepository selectionRepo, PersonRepository personRepo, ProductRepository productRepo) {
        this.selectionRepo = selectionRepo;
        this.personRepo = personRepo;
        this.productRepo = productRepo;
    }

    public SelectionDTO getByPersonId(Long personId){
        Person p = personRepo.findById(personId).orElseThrow();
        return selectionRepo.findByPerson(p)
                .map(sel -> new SelectionDTO(p.getId(), sel.getItems().stream()
                        .map(i -> new SelectionDTO.Item(i.getProduct().getId(), i.getQuantity())).toList()))
                .orElse(new SelectionDTO(p.getId(), List.of()));
    }

    @Transactional
    public SelectionDTO upsert(Long personId, SelectionDTO dto){
        Person p = personRepo.findById(personId).orElseThrow();
        Selection sel = selectionRepo.findByPerson(p).orElseGet(() -> {
            Selection s = new Selection();
            s.setPerson(p);
            return s;
        });

        sel.getItems().clear();
        List<SelectionItem> items = new ArrayList<>();
        for (SelectionDTO.Item it : dto.items()){
            Product prod = productRepo.findById(it.productId()).orElseThrow();
            SelectionItem si = new SelectionItem();
            si.setSelection(sel);
            si.setProduct(prod);
            si.setQuantity(Math.max(1, it.quantity()));
            items.add(si);
        }
        sel.getItems().addAll(items);
        selectionRepo.save(sel);
        return getByPersonId(personId);
    }
}

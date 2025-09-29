package br.eng.eliseu.choice.web.controller;

import br.eng.eliseu.choice.service.SelectionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/selections")
public class SelecionadoController {

    private final SelectionService service;

    public SelecionadoController(SelectionService service) {
        this.service = service;
    }

    private Long personIdFromSubject(String subject){
        return Long.parseLong(subject);
    }

/*
    @GetMapping("/me")
    public SelectionDTO mySelection(@RequestAttribute(name="jwt-subject", required=false) String subject){
        Long personId = personIdFromSubject(subject);
        return service.getByPersonId(personId);
    }

    @PostMapping
    public SelectionDTO save(@RequestAttribute(name="jwt-subject", required=false) String subject,
                             @RequestBody SelectionDTO dto){
        Long personId = personIdFromSubject(subject);
        return service.upsert(personId, dto);
    }
*/

}

package br.eng.eliseu.choice.web;

import br.eng.eliseu.choice.repo.PersonRepository;
import br.eng.eliseu.choice.service.SelectionService;
import br.eng.eliseu.choice.web.dto.SelectionDTO;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/selections")
public class SelectionController {

    private final SelectionService service;

    public SelectionController(SelectionService service) {
        this.service = service;
    }

    private Long personIdFromSubject(String subject){
        return Long.parseLong(subject);
    }

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
}

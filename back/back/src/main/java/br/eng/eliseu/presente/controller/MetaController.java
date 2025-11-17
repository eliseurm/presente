package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.StatusEnum;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/meta")
public class MetaController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> listarStatus() {
        List<Map<String, String>> values = List.of(StatusEnum.values()).stream()
                .map(e -> Map.of(
                        "value", e.name(),
                        "label", e.getNome()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("values", values));
    }
}

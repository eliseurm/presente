package br.eng.eliseu.choice.web.dto;

import java.util.List;

public record SelectionDTO(Long personId, List<Item> items) {
    public record Item(Long productId, int quantity) {}
}

package br.eng.eliseu.choice.repository;

import br.eng.eliseu.choice.model.Imagem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImagemRepository extends JpaRepository<Imagem, Long> {
}

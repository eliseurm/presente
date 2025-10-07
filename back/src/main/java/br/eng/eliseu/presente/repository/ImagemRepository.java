package br.eng.eliseu.presente.repository;

import br.eng.eliseu.presente.model.Imagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ImagemRepository extends JpaRepository<Imagem, Long>, JpaSpecificationExecutor<Imagem> {
}

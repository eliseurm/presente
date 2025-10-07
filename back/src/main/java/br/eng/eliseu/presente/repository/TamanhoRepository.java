package br.eng.eliseu.presente.repository;


import br.eng.eliseu.presente.model.Tamanho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TamanhoRepository extends JpaRepository<Tamanho, Long>, JpaSpecificationExecutor<Tamanho> {
}
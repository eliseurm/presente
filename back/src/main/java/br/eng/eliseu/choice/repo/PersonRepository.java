package br.eng.eliseu.choice.repo;

import br.eng.eliseu.choice.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonRepository extends JpaRepository<Person, Long> {
}

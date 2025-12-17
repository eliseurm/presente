package br.eng.eliseu.presente.controller;

import br.eng.eliseu.presente.model.Pessoa;
import br.eng.eliseu.presente.model.ChaveMagica;
import br.eng.eliseu.presente.model.StatusEnum;
import br.eng.eliseu.presente.repository.ChaveMagicaRepository;
import br.eng.eliseu.presente.repository.PessoaRepository;
import br.eng.eliseu.presente.security.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/auth/pessoa")
public class PessoaAuthController {

    private final PessoaRepository pessoaRepository;
    private final ChaveMagicaRepository chaveMagicaRepository;
    private final AuthenticationService authenticationService;

    private static final Pattern TELEFONE_RGX = Pattern.compile("^\\+?\\d{8,15}$");

    public PessoaAuthController(PessoaRepository pessoaRepository,
                                ChaveMagicaRepository chaveMagicaRepository,
                                AuthenticationService authenticationService) {
        this.pessoaRepository = pessoaRepository;
        this.chaveMagicaRepository = chaveMagicaRepository;
        this.authenticationService = authenticationService;
    }

    // POST /auth/pessoa/cadastrar
    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest req) {
        if (req == null || isBlank(req.telefone()) || isBlank(req.email())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Telefone e email são obrigatórios"));
        }
        if (!TELEFONE_RGX.matcher(req.telefone()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Telefone inválido"));
        }
        if (req.senha() == null || req.senha().length() > 8) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Senha deve ter no máximo 8 caracteres"));
        }

        // Cria ou atualiza Pessoa
        Pessoa pessoa = pessoaRepository.findByEmailOrTelefone(req.email(), req.telefone()).orElseGet(Pessoa::new);
        pessoa.setNome(req.nome());
        pessoa.setEmail(req.email());
        pessoa.setTelefone(req.telefone());
        pessoa.setEndereco(req.endereco());
        pessoa.setComplemento(req.complemento());
        pessoa.setCidade(req.cidade());
        pessoa.setEstado(req.estado());
        pessoa.setCep(req.cep());
        pessoa.setSenha(req.senha()); // texto puro, por requisito
        pessoa.setStatus(StatusEnum.ATIVO);
        pessoa = pessoaRepository.save(pessoa);

        // Gera token de 6 dígitos e persiste em ChaveMagica
        String code6 = gerarCodigo6();
        ChaveMagica cm = ChaveMagica.builder()
                .pessoa(pessoa)
                .tokenLookup(code6) // simples para lookup; poderia usar hash
                .expiraEm(LocalDateTime.now().plusMinutes(15))
                .usoUnico(true)
                .quantidadeAcesso(0)
                .build();
        chaveMagicaRepository.save(cm);

        // Mock de envio de e-mail: logar o código no console
        System.out.println("[DEBUG_LOG] Enviar email para " + req.email() + ": codigo de confirmacao = " + code6);

        return ResponseEntity.ok(Map.of(
                "mensagem", "Cadastro iniciado. Um código foi enviado para seu email.",
                "pessoa_id", pessoa.getId()
        ));
    }

    // POST /auth/pessoa/confirmar
    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmar(@RequestBody ConfirmarRequest req) {
        if (req == null || req.pessoaId() == null || isBlank(req.codigo())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Dados inválidos"));
        }
        var opt = chaveMagicaRepository.findTopByPessoa_IdAndTokenLookupOrderByExpiraEmDesc(req.pessoaId(), req.codigo());
        if (opt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("erro", "Código inválido"));
        }
        var chave = opt.get();
        if (chave.getExpiraEm() != null && chave.getExpiraEm().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body(Map.of("erro", "Código expirado"));
        }
        // Marca utilizado e ativa a pessoa
        chave.setUtilizado(LocalDateTime.now());
        chaveMagicaRepository.save(chave);

        Pessoa pessoa = pessoaRepository.findById(req.pessoaId()).orElseThrow();
        pessoa.setStatus(StatusEnum.ATIVO);
        pessoaRepository.save(pessoa);

        return ResponseEntity.ok(Map.of("mensagem", "Cadastro confirmado com sucesso"));
    }

    // POST /auth/pessoa/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginPessoaRequest req,
                                   @RequestParam(name = "remember", defaultValue = "false") boolean remember) {
        if (req == null || (isBlank(req.login()) || isBlank(req.senha()))) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Login e senha são obrigatórios"));
        }
        var pessoaOpt = TELEFONE_RGX.matcher(req.login()).matches()
                ? pessoaRepository.findByTelefone(req.login())
                : pessoaRepository.findByEmail(req.login());
        if (pessoaOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("erro", "Pessoa não encontrada"));
        }
        Pessoa pessoa = pessoaOpt.get();
        if (pessoa.getSenha() == null || !pessoa.getSenha().equals(req.senha())) {
            return ResponseEntity.status(401).body(Map.of("erro", "Credenciais inválidas"));
        }
        if (!StatusEnum.ATIVO.equals(pessoa.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("erro", "Cadastro não confirmado"));
        }

        // Cria Authentication artificial com ROLE_USUARIO
        Authentication auth = new UsernamePasswordAuthenticationToken(
                req.login(),
                "",
                List.of(new SimpleGrantedAuthority("ROLE_USUARIO"))
        );

        String token = authenticationService.authenticateWithClaims(auth, remember,
                Map.of(
                        "pessoa_id", pessoa.getId()
                ),
                req.login()
        );

        return ResponseEntity.ok(Map.of(
                "token", token,
                "pessoa_id", pessoa.getId(),
                "login", req.login(),
                "role", "USUARIO",
                "remember", remember
        ));
    }

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private static String gerarCodigo6() {
        Random r = new Random();
        int code = 100000 + r.nextInt(900000);
        return Integer.toString(code);
    }

    // DTOs
    public record CadastroRequest(String nome, String telefone, String email,
                                  String senha, String endereco, String complemento,
                                  String cidade, String estado, String cep) {}
    public record ConfirmarRequest(Long pessoaId, String codigo) {}
    public record LoginPessoaRequest(String login, String senha) {}
}

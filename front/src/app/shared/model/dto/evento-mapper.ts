import {Evento} from "@/shared/model/evento";
import {EventoDTO} from "@/shared/model/dto/evento-dto";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {EventoProduto} from "@/shared/model/evento-produto";
import {Cliente} from "@/shared/model/cliente";
import {EventoPessoaMapper} from "@/shared/model/dto/evento-pessoa-mapper";
import {EventoProdutoMapper} from "@/shared/model/dto/evento-produto-mapper";

export class EventoMapper {

    public static fromDTO(dto: EventoDTO): Evento | undefined {
        if (!dto) return undefined;

        const cliente = new Cliente()
        cliente.id = dto.clienteId;
        cliente.nome = dto.clienteNome;

        const evento: Evento = {

            id: dto.id,
            nome: dto.nome,
            descricao: dto.descricao,
            status: dto.status,
            anotacoes: dto.anotacoes,
            version: dto.version,

            // Cliente: Mapeia ID para objeto parcial { id: number }
            cliente: cliente,

            // Datas: Conversão de Date (DTO) para Date | string (Entidade)
            inicio: dto.inicio,
            fimPrevisto: dto.fimPrevisto,
            fim: dto.fim,

            // Mapeamento das listas aninhadas
            pessoas: dto.pessoas?.filter(p => !!p)
                .map(EventoPessoaMapper.fromDTO)
                .filter((p): p is EventoPessoa => !!p),
            produtos: dto.produtos?.filter(p => !!p)
                .map(EventoProdutoMapper.fromDTO)
                .filter((p): p is EventoProduto => !!p),

            // A lista 'escolhas' (EventoEscolha[]) não está no DTO, então é undefined
            escolhas: undefined
        };

        return evento;
    }

    public static toDTO(evento: Evento): EventoDTO | undefined{
        if (!evento) return undefined;

        return {
            id: evento.id,
            nome: evento.nome,
            descricao: evento.descricao,
            status: evento.status,
            anotacoes: evento.anotacoes,
            version: evento.version,

            // Cliente: Extrai apenas o ID
            clienteId: evento.cliente && 'id' in evento.cliente ? evento.cliente.id : undefined,
            clienteNome: evento.cliente && 'nome' in evento.cliente ? evento.cliente.nome : undefined,

            inicio: evento.inicio as Date,
            fimPrevisto: evento.fimPrevisto as Date,
            fim: evento.fim as Date,

            // Mapeamento das listas aninhadas
            pessoas: evento.pessoas?.filter(p => !!p)
                .map(EventoPessoaMapper.toDTO)
                .filter((p): p is EventoPessoa => !!p),
            produtos: evento.produtos?.filter(p => !!p)
                .map(EventoProdutoMapper.toDTO)
                .filter((p): p is EventoProduto => !!p)
        };

    }
}

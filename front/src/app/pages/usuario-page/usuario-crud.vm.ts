import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {Usuario} from '@/shared/model/usuario';
import {UsuarioFilter} from '@/shared/model/filter/usuario-filter';
import {UsuarioService} from '@/services/usuario.service';
import {PapelEnum} from '@/shared/model/enum/papel.enum';
import {StatusEnum} from '@/shared/model/enum/status.enum';

@Injectable()
export class UsuarioCrudVM extends AbstractCrud<Usuario, UsuarioFilter> {

    constructor(
        port: UsuarioService,
        route: ActivatedRoute,
        router: Router,
    ) {
        super(port, route, router);
        this.model = this.newModel();
        this.filter = this.newFilter();
    }

    protected newModel(): Usuario {
        const novo: Usuario = new Usuario();
        novo.papel = PapelEnum.CLIENTE;
        novo.status = StatusEnum.ATIVO;
        return novo;
    }

    protected newFilter(): UsuarioFilter {
        return new UsuarioFilter();
    }

    override canDoSave(): boolean {
        const errors: string[] = [];
        if (!(this.model?.username && String(this.model.username).trim().length > 0)) errors.push('Informe o usuário.');
        const user = String(this.model?.username || '').trim();
        if (user.length === 0 || /\s/.test(user) || !/^[a-z0-9._]+$/.test(user)) errors.push('Informe um usuário válido (somente letras minusculas e números, sem espaços).');
        if (!(this.model?.senha && String(this.model.senha).trim().length > 0)) errors.push('Informe a senha.');
        if (!(this.model?.papel && String(this.model.papel).trim().length > 0)) errors.push('Informe o papel.');
        this.errorMessages = errors;
        this.errorsVisible = errors.length > 0;
        return errors.length === 0;
    }

    // Normaliza enums/valores antes de salvar para o formato esperado pelo back-end
    override doSave(): import('rxjs').Observable<Usuario> {

        const payload: any = {...this.model} as any;
        payload.papel = (this.model.papel as any).key ?? (this.model.papel as any).name ?? this.model.papel;
        payload.status = (this.model.status as any).key ?? (this.model.status as any).name ?? this.model.status;
        this.model = payload;

        return super.doSave();

    }

}

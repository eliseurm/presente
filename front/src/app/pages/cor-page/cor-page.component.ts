import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {ButtonModule} from 'primeng/button';
import {ColorPickerModule} from 'primeng/colorpicker';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';

import {CrudFilterComponent} from '../../shared/components/crud-filter/crud-filter.component';
import {CorService} from '../../services/cor.service';
import {FilterField} from '../../shared/components/crud-filter/filter-field';
import {Cor} from "@/shared/model/cor";
import {CorFilter} from "@/shared/model/filter/cor-filter";
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import {CrudComponent} from '@/shared/crud/crud.component';
import {TableModule} from 'primeng/table';
import {ErmDataGridComponent, ErmColumnComponent, ErmTemplateDirective} from '@/shared/components/erm-data-grid';
import {CorCrudVM} from './cor-crud.vm';

@Component({
    selector: 'cor-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ColorPickerModule,
        InputTextModule,
        ToastModule,
        CrudFilterComponent,
        CrudComponent,
        TableModule,
        ErmDataGridComponent,
        ErmColumnComponent,
        ErmTemplateDirective
    ],
    templateUrl: './cor-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss',
        './cor-page.component.scss'
    ],
    providers: [MessageService, CorCrudVM]
})
@CrudMetadata("EventoPageComponent", [Cor, CorFilter])
export class CorPageComponent {

    @ViewChild('crudRef') crudRef?: CrudComponent<Cor, CorFilter>;

    readonly filterFields: FilterField[] = [
        {
            key: 'nome',
            label: 'Nome da Cor',
            type: 'text',
            placeholder: 'Buscar por nome'
        }
    ];

    // Suporte ao API EyeDropper (conta-gotas do sistema)
    supportsEyeDropper: boolean = typeof (window as any).EyeDropper === 'function';

    constructor(
        public vm: CorCrudVM,
        private corService: CorService,
        private messageService: MessageService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.vm.init();
    }

    /**
     * Abre o conta-gotas nativo do sistema (quando suportado) para escolher uma cor de qualquer ponto da tela.
     */
    pickColorFromScreen() {
        try {
            const EyeDropperCtor = (window as any).EyeDropper;
            if (typeof EyeDropperCtor !== 'function') {
                this.supportsEyeDropper = false;
                return;
            }
            const eyeDropper = new EyeDropperCtor();
            eyeDropper.open().then((result: any) => {
                const sCorRGB = result?.sRGBHex as string | undefined; // e.g. #RRGGBB
                if (!sCorRGB) return;
                // Atualiza HEX e RGBA derivados
                (this.vm.model as any).corHex = this.rgbToHex(sCorRGB);
                (this.vm.model as any).corRgbA = sCorRGB;
            }).catch(() => {
                // Usuário cancelou ou navegador bloqueou; não faz nada
            });
        } catch {
            this.supportsEyeDropper = false;
        }
    }

    // -- onLazyLoad, dispara ao ser criada e sempre que a grid precisa ser atualizada porque mudou, por exemplo, a quantidade de linhas
    onLazyLoad(event: any) {
        const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
        const size = event.rows || this.vm.filter.size || 10;
        this.vm.filter.page = page;
        this.vm.filter.size = size;
        this.vm.filter.order = ['id,asc'];
        this.vm.doFilter().subscribe();
    }

    onColorChange(cor: any, event: any) {
        const color = typeof event === 'string' ? event : event?.value || event;

        if (color && typeof color === 'string') {
            const hexColor = color.startsWith('#') ? color : `#${color}`;
            cor.corHex = hexColor;
            cor.corRgbA = this.hexToRgba(hexColor);
        }
    }

    onHexChange(cor: any, hex: string) {
        if (hex && typeof hex === 'string') {
            cor.corRgbA = this.hexToRgba(hex);
        }
    }

    /**
     * Converte cor HEX para RGBA
     */
    hexToRgba(hex: string, alpha: number = 1): string {
        hex = hex.replace('#', '');

        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        if (hex.length !== 6) {
            return `rgba(0, 0, 0, ${alpha})`;
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    rgbToHex(rgb: string): string {
        const result = rgb.match(/\d+/g);
        if (!result) return "";

        const [r, g, b] = result.map(Number);

        const toHex = (n: number) => n.toString(16).padStart(2, "0");

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    onClearFilters() {
        this.vm.filter = this.vm['newFilter']();
        this.vm.doFilter().subscribe();
    }

    onCloseCrud() {
        this.router.navigate(['/']);
    }
}

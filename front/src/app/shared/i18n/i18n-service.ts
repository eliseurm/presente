import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PrimeNG } from 'primeng/config';

export type LangCode = 'pt' | 'en' | 'es';
type Dict = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class I18nService {

    private readonly basePath = 'assets/i18n';
    private cache = new Map<LangCode, Dict>();
    private inflight = new Map<LangCode, Promise<Dict>>();

    private primeng = inject(PrimeNG);

    readonly lang = signal<LangCode>(this.restore());

    // Dicionário de traduções nativas do PrimeNG
    private primengTranslations: Record<LangCode, any> = {
        pt: {
            dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
            dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
            dayNamesMin: ['Do', 'Se', 'Te', 'Qa', 'Qi', 'Se', 'Sa'],
            monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            today: 'Hoje',
            clear: 'Limpar',
            dateFormat: 'dd/mm/yy',
            firstDayOfWeek: 0,
            emptyMessage: 'Nenhum resultado encontrado',
            emptyFilterMessage: 'Nenhum resultado encontrado',
            weak: 'Fraco',
            medium: 'Médio',
            strong: 'Forte',
            passwordPrompt: 'Digite uma senha'
        },
        es: {
            dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            today: 'Hoy',
            clear: 'Limpiar',
            dateFormat: 'dd/mm/yy',
            firstDayOfWeek: 1,
            emptyMessage: 'No se encontraron resultados',
            emptyFilterMessage: 'No se encontraron resultados',
            weak: 'Débil',
            medium: 'Medio',
            strong: 'Fuerte',
            passwordPrompt: 'Ingrese una contraseña'
        },
        en: {
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            today: 'Today',
            clear: 'Clear',
            dateFormat: 'mm/dd/yy',
            firstDayOfWeek: 0,
            emptyMessage: 'No results found',
            emptyFilterMessage: 'No results found',
            weak: 'Weak',
            medium: 'Medium',
            strong: 'Strong',
            passwordPrompt: 'Enter a password'
        }
    };

    constructor(private http: HttpClient) {}

    async init(): Promise<void> {
        await this.load(this.lang());
        this.applyDomLang(this.lang());
    }

    async setLang(next: LangCode): Promise<void> {
        if (this.lang() === next) return;

        await this.load(next);
        this.lang.set(next);
        this.applyDomLang(next);

        try {
            localStorage.setItem('lang', next);
        } catch {}

        window.location.reload();
    }

    t(key: string, params?: Record<string, string | number>): string {
        const active = this.cache.get(this.lang()) ?? {};
        const en = this.cache.get('en') ?? {};
        let text = active[key] ?? en[key] ?? key;
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
            }
        }
        return text;
    }

    private async load(lang: LangCode): Promise<void> {
        const [enDict, targetDict] = await Promise.all([this.ensure('en'), lang === 'en' ? Promise.resolve({} as Dict) : this.ensure(lang)]);
        const merged = { ...enDict, ...targetDict };
        this.cache.set(lang, merged);

        // --- CORREÇÃO AQUI: Configurando via serviço 'PrimeNG' ---
        if (this.primengTranslations[lang]) {
            this.primeng.setTranslation(this.primengTranslations[lang]);
        }
    }

    private ensure(lang: LangCode): Promise<Dict> {
        if (this.cache.has(lang)) {
            return Promise.resolve(this.cache.get(lang)!);
        }
        if (this.inflight.has(lang)) {
            return this.inflight.get(lang)!;
        }
        const req = this.http
            .get<Dict>(`${this.basePath}/${lang}.json`, { withCredentials: false })
            .toPromise()
            .then((dict) => {
                this.cache.set(lang, dict ?? {});
                this.inflight.delete(lang);
                return dict ?? {};
            })
            .catch(() => {
                this.cache.set(lang, {});
                this.inflight.delete(lang);
                return {};
            });
        this.inflight.set(lang, req);
        return req;
    }

    private restore(): LangCode {
        try {
            const saved = localStorage.getItem('lang') as LangCode | null;
            if (saved === 'pt' || saved === 'en' || saved === 'es') return saved;
        } catch {}
        const nav = (navigator.language || 'pt').toLowerCase();
        if (nav.startsWith('pt')) return 'pt';
        if (nav.startsWith('es')) return 'es';
        return 'en';
    }

    private applyDomLang(code: LangCode) {
        try {
            document.documentElement.setAttribute('lang', code);
        } catch {}
    }
}

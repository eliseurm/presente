// TypeScript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type LangCode = 'pt' | 'en' | 'es';
type Dict = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class I18nService {
    private readonly basePath = 'assets/i18n';
    private cache = new Map<LangCode, Dict>();
    private inflight = new Map<LangCode, Promise<Dict>>();

    readonly lang = signal<LangCode>(this.restore());

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
        // Carrega primeiro EN como base (fallback), depois o alvo e mescla
        const [enDict, targetDict] = await Promise.all([
            this.ensure('en'),
            lang === 'en' ? Promise.resolve({} as Dict) : this.ensure(lang)
        ]);
        const merged = { ...enDict, ...targetDict };
        this.cache.set(lang, merged);
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

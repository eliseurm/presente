import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `
    <div class="layout-footer">
        Señorita Brasil by
        <a href="https://eliseu.eng.br" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Eliseu</a>
    </div>
    `
})
export class AppFooter {}

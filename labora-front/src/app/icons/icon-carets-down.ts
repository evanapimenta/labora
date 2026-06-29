import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'icon-carets-down',
    standalone: true,
    imports: [CommonModule],
    template: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" [ngClass]="class">
            <path d="M19 11L12 17L5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path opacity="0.5" d="M19 7L12 13L5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    `,
})
export class IconCaretsDownComponent {
    @Input() duotone: boolean = true;
    @Input() fill: boolean = false;
    @Input() class: any = '';
}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'icon-menu',
    standalone: true,
    imports: [CommonModule],
    template: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" [ngClass]="class">
            <path d="M3 7H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M3 12H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M3 17H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
    `,
})
export class IconMenuComponent {
    @Input() fill: boolean = false;
    @Input() class: any = '';
}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'icon-close',
    standalone: true,
    imports: [CommonModule],
    template: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" [ngClass]="class">
            <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    `,
})
export class IconCloseComponent {
    @Input() fill: boolean = false;
    @Input() class: any = '';
}


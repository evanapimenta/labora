import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'icon-file',
    standalone: true,
    imports: [CommonModule],
    template: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" [ngClass]="class">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.5" />
            <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.5" />
        </svg>
    `,
})
export class IconFileComponent {
    @Input() class: any = '';
}

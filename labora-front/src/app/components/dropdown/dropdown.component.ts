import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full">
      <select 
        [id]="id" 
        class="form-select text-white-dark transition-colors duration-300 outline-none w-full"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [style.borderColor]="value && dynamicColor ? dynamicColor : null"
        [style.boxShadow]="value && dynamicColor ? '0 0 0 1px ' + dynamicColor : null">
        <option [ngValue]="null" disabled selected>{{ placeholder }}</option>
        <option *ngFor="let opt of options" [value]="opt">{{ opt }}</option>
      </select>
    </div>
  `,
  styles: [`
    select:focus {
      border-color: var(--dynamic-primary, #ea5d7bff) !important;
      box-shadow: 0 0 0 1px var(--dynamic-primary, transparent) !important;
    }
  `]
})
export class DropdownComponent {
  @Input() id: string = '';
  @Input() placeholder: string = 'Selecione...';
  @Input() options: string[] = [];
  @Input() dynamicColor: string | undefined = undefined;
  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();

  onValueChange(newVal: any) {
    this.valueChange.emit(newVal);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-input.component.html'
})
export class FormInputComponent {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() readonly: boolean = false;
  @Input() placeholder: string = '';

  @Output() valueChange = new EventEmitter<string>();

  onValueChange(val: string) {
    this.value = val;
    this.valueChange.emit(val);
  }
}

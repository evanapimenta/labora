import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconSearchComponent } from '../../icons/icon-search';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconSearchComponent],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent {
  @Input() placeholder: string = 'Digite para pesquisar...';
  @Input() value: string = '';
  @Input() disabled: boolean = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  private searchTimeout: any;

  onInputChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.searchChange.emit(this.value);
    }, 300);
  }

  onEnterPress(): void {
    this.search.emit(this.value);
  }
}

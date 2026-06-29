import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branch-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-card.component.html'
})
export class BranchCardComponent {
  @Input() branch: any;
  @Input() selectedExam: any;
  @Input() isSummaryMode: boolean = false;

  @Output() select = new EventEmitter<void>();
  @Output() change = new EventEmitter<void>();

  onSelect() {
    this.select.emit();
  }

  onChange() {
    this.change.emit();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-card.component.html'
})
export class ExamCardComponent {
  @Input() exam: any;
  @Input() isSelected: boolean = false;
  @Input() showActions: boolean = true;
  @Input() isSummaryMode: boolean = false;

  @Output() select = new EventEmitter<void>();
  @Output() change = new EventEmitter<void>();
  @Output() viewDetails = new EventEmitter<void>();

  onSelect() {
    this.select.emit();
  }

  onChange() {
    this.change.emit();
  }

  onViewDetails(event: Event) {
    event.stopPropagation();
    this.viewDetails.emit();
  }
}

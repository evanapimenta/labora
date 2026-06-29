import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TestController } from '../../core/controllers/test.controller';
import { NgxCustomModalComponent } from 'ngx-custom-modal';

@Component({
  selector: 'app-user-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxCustomModalComponent],
  templateUrl: './user-exams.component.html',
  styleUrl: './user-exams.component.css'
})
export class UserExamsComponent implements OnInit {
  @ViewChild('detailsModal') detailsModal!: any;
  @ViewChild('preparoModal') preparoModal!: any;

  examsData: any[] = [];
  totalPages = 0;
  totalElements = 0;
  currentPage = 1;
  pageSize = 6;
  searchQuery = '';
  selectedCategory = '';

  categories: { label: string, value: string }[] = [
    { label: 'Todos', value: '' },
    { label: 'Genética Médica', value: 'Genética Médica' },
    { label: 'Investigação de Fertilidade', value: 'Investigação de Fertilidade' },
    { label: 'Medicina Fetal', value: 'Medicina Fetal' },
    { label: 'Medicina Reprodutiva', value: 'Medicina Reprodutiva' }
  ];

  selectedExamForDetails: any = null;
  selectedExamForPreparo: any = null;
  isBrowser = false;
  loading = false;

  constructor(
    private testController: TestController,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadExams();
  }

  loadCategories(): void {
    this.testController.getCategories().subscribe({
      next: (cats: any) => {
        if (Array.isArray(cats)) {
          this.categories = [
            { label: 'Todos', value: '' },
            ...cats.map((cat: string) => ({
              label: cat,
              value: cat
            }))
          ];
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar categorias dinâmicas:', err);
      }
    });
  }

  loadExams(): void {
    this.loading = true;
    const pageIndex = this.currentPage - 1;
    this.testController.getAll(pageIndex, this.pageSize, this.searchQuery, this.selectedCategory).subscribe({
      next: (res: any) => {
        const content = res.content || [];
        this.examsData = content.map((exam: any) => ({
          ...exam,
          category: exam.testCategory || exam.category || 'Outros'
        }));
        this.totalPages = res.totalPages || 0;
        this.totalElements = res.totalElements || 0;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar exames na listagem:', err);
        this.loading = false;
      }
    });
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadExams();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadExams();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadExams();
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadExams();
  }

  selectCategory(categoryVal: string): void {
    this.selectedCategory = categoryVal;
    this.currentPage = 1;
    this.loadExams();
  }

  openDetails(exam: any): void {
    this.selectedExamForDetails = exam;
    if (this.isBrowser && this.detailsModal) {
      this.detailsModal.open();
    }
  }

  closeDetailsModal(): void {
    if (this.isBrowser && this.detailsModal) {
      this.detailsModal.close();
    }
    this.selectedExamForDetails = null;
  }

  openPreparo(exam: any): void {
    this.selectedExamForPreparo = exam;
    if (this.isBrowser && this.preparoModal) {
      this.preparoModal.open();
    }
  }

  closePreparoModal(): void {
    if (this.isBrowser && this.preparoModal) {
      this.preparoModal.close();
    }
    this.selectedExamForPreparo = null;
  }

  scheduleExam(exam: any): void {
    this.router.navigate(['/schedule'], { queryParams: { exam: exam.name } });
  }
}

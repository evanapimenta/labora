import { Component, OnInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TestController } from '../../core/controllers/test.controller';
import { LaboratoryController } from '../../core/controllers/laboratory.controller';
import { ScheduleController } from '../../core/controllers/schedule.controller';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { ExamCardComponent } from '../../components/exam-card/exam-card.component';
import { BranchCardComponent } from '../../components/branch-card/branch-card.component';
import { NgxCustomModalComponent } from 'ngx-custom-modal';
import { NotificationService } from '../../core/services/notification.service';
import { AccessService } from '../../core/services/access.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SearchInputComponent, ExamCardComponent, BranchCardComponent, NgxCustomModalComponent],
  templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {

  @ViewChild('detailsModal') detailsModal!: any;

  currentStep = 1;
  bookingSuccess = false;
  bookingError: string | null = null;
  loading = false;

  selectedExamForDetails: any = null;

  examsData: any[] = [];
  private _examSearchQuery = '';
  suggestions: any[] = [];
  showSuggestions = false;
  activeSuggestionIndex = -1;
  private debounceTimeout: any;

  // Region Autocomplete properties
  regionSuggestions: any[] = [];
  showRegionSuggestions = false;
  activeRegionSuggestionIndex = -1;
  get examSearchQuery(): string {
    return this._examSearchQuery;
  }
  set examSearchQuery(val: string) {
    this._examSearchQuery = val;
    this.currentPage = 1;
    if (!val.trim()) {
      this.loadExams();
    }
  }

  selectedExamObject: any = null;
  selectedExam: string | null = null;

  currentPage = 1;
  pageSize = 6;

  branchesData: any[] = [];
  filteredBranches: any[] = [];
  regionSearchQuery = '';
  selectedBranchObject: any = null;

  currentBranchPage = 1;
  branchPageSize = 3;

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  calendarDays: any[] = [];
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  timeSlots: string[] = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  isBrowser = false;

  // city pre-filter coming from query param
  private prefilledCity = '';
  private autoSelectDone = false;

  constructor(
    private testController: TestController,
    private laboratoryController: LaboratoryController,
    private scheduleController: ScheduleController,
    private accessService: AccessService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private notificationService: NotificationService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(params => {
        this.autoSelectDone = false;
        if (params['exam']) {
          this._examSearchQuery = params['exam'];
        } else {
          this._examSearchQuery = '';
        }
        if (params['city']) {
          this.prefilledCity = params['city'];
          this.regionSearchQuery = params['city'];
        } else {
          this.prefilledCity = '';
          this.regionSearchQuery = '';
        }
        this.loadExams();
      });
    }
  }


  totalPages = 0;
  totalElements = 0;

  get pagedExams(): any[] {
    return this.examsData;
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

  // ─── Autocomplete Handlers ──────────────────────────────────────────────────

  onSearchInputChange() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    const query = this.examSearchQuery;
    if (!query.trim()) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.loadExams(); // Reload list
      return;
    }

    this.debounceTimeout = setTimeout(() => {
      this.testController.getAll(0, 10, query).subscribe({
        next: (res: any) => {
          this.suggestions = res.content || [];
          this.showSuggestions = true;
          this.activeSuggestionIndex = -1;
        },
        error: (err) => {
          console.error('Erro ao buscar sugestões:', err);
        }
      });
    }, 250);
  }

  onInputFocus() {
    if (this.examSearchQuery.trim()) {
      this.showSuggestions = true;
    }
  }

  onInputBlur() {
    // delay to let mousedown on suggestion buttons trigger
    setTimeout(() => {
      this.showSuggestions = false;
    }, 180);
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showSuggestions || this.suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.suggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex - 1 + this.suggestions.length) % this.suggestions.length;
    } else if (event.key === 'Enter') {
      if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < this.suggestions.length) {
        event.preventDefault();
        this.selectSuggestion(this.suggestions[this.activeSuggestionIndex]);
      }
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: any) {
    this.examSearchQuery = suggestion.name;
    this.showSuggestions = false;
    this.suggestions = [];
    this.selectExam(suggestion);
  }

  // ─── Region Autocomplete Handlers ──────────────────────────────────────────

  onRegionInputChange() {
    const q = this.regionSearchQuery.trim().toLowerCase();
    if (!q) {
      this.regionSuggestions = [];
      this.showRegionSuggestions = false;
      this.filterBranches();
      return;
    }

    const citySet = new Set<string>();
    const neighborhoodSet = new Set<string>();
    const nameSet = new Set<string>();

    const matches: any[] = [];

    this.branchesData.forEach(b => {
      const city = b.city || '';
      const neighborhood = b.neighborhood || '';
      const name = b.name || '';

      if (city.toLowerCase().includes(q) && !citySet.has(city)) {
        citySet.add(city);
        matches.push({ label: `${city} (Cidade)`, value: city, type: 'city' });
      }
      if (neighborhood.toLowerCase().includes(q) && !neighborhoodSet.has(neighborhood)) {
        neighborhoodSet.add(neighborhood);
        matches.push({ label: `${neighborhood} (Bairro)`, value: neighborhood, type: 'neighborhood' });
      }
      if (name.toLowerCase().includes(q) && !nameSet.has(name)) {
        nameSet.add(name);
        matches.push({ label: `${name} (Unidade)`, value: name, type: 'name' });
      }
    });

    this.regionSuggestions = matches.slice(0, 10);
    this.showRegionSuggestions = true;
    this.activeRegionSuggestionIndex = -1;
  }

  onRegionInputFocus() {
    if (this.regionSearchQuery.trim()) {
      this.showRegionSuggestions = true;
    }
  }

  onRegionInputBlur() {
    setTimeout(() => {
      this.showRegionSuggestions = false;
    }, 180);
  }

  onRegionKeyDown(event: KeyboardEvent) {
    if (!this.showRegionSuggestions || this.regionSuggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeRegionSuggestionIndex = (this.activeRegionSuggestionIndex + 1) % this.regionSuggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeRegionSuggestionIndex = (this.activeRegionSuggestionIndex - 1 + this.regionSuggestions.length) % this.regionSuggestions.length;
    } else if (event.key === 'Enter') {
      if (this.activeRegionSuggestionIndex >= 0 && this.activeRegionSuggestionIndex < this.regionSuggestions.length) {
        event.preventDefault();
        this.selectRegionSuggestion(this.regionSuggestions[this.activeRegionSuggestionIndex]);
      }
    } else if (event.key === 'Escape') {
      this.showRegionSuggestions = false;
    }
  }

  selectRegionSuggestion(suggestion: any) {
    this.regionSearchQuery = suggestion.value;
    this.showRegionSuggestions = false;
    this.regionSuggestions = [];
    this.onRegionSearchClick();
  }

  loadExams(): void {
    const pageIndex = this.currentPage - 1;
    this.testController.getAll(pageIndex, this.pageSize, this.examSearchQuery).subscribe({
      next: (res: any) => {
        this.examsData = res.content || [];
        this.totalPages = res.totalPages || 0;
        this.totalElements = res.totalElements || 0;

        if (!this.autoSelectDone && this._examSearchQuery) {
          const matchedExam = this.examsData.find(
            (e: any) => e.name.toLowerCase() === this._examSearchQuery.toLowerCase()
          );
          if (matchedExam) {
            this.autoSelectDone = true;
            this.selectExam(matchedExam);
          }
        }
      },
      error: (err: any) => {
        console.error('Erro ao carregar exames do backend:', err);
      }
    });
  }

  get filteredExams(): any[] {
    return this.examsData;
  }

  onSearchClick() {
    this.currentPage = 1;
    this.loadExams();
  }

  selectExam(exam: any) {
    this.selectedExam = exam.name;
    this.selectedExamObject = exam;
    this.selectedBranchObject = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookingSuccess = false;
    this.bookingError = null;
    this.currentStep = 2;

    this.loadLaboratories();
  }

  get totalBranchPages(): number {
    return Math.ceil(this.filteredBranches.length / this.branchPageSize);
  }

  get pagedBranches(): any[] {
    const start = (this.currentBranchPage - 1) * this.branchPageSize;
    return this.filteredBranches.slice(start, start + this.branchPageSize);
  }

  get branchPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalBranchPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToBranchPage(page: number) {
    if (page >= 1 && page <= this.totalBranchPages) {
      this.currentBranchPage = page;
    }
  }

  prevBranchPage() {
    if (this.currentBranchPage > 1) {
      this.currentBranchPage--;
    }
  }

  nextBranchPage() {
    if (this.currentBranchPage < this.totalBranchPages) {
      this.currentBranchPage++;
    }
  }

  loadLaboratories() {
    this.loading = true;
    this.laboratoryController.getAll().subscribe({
      next: (res: any) => {
        const labs = Array.isArray(res) ? res : (res.content || []);
        if (labs && labs.length > 0) {
          const list: any[] = [];
          labs.forEach((lab: any) => {
            const branches = lab.branches || [];
            if (branches.length > 0) {
              branches.forEach((b: any) => {
                list.push({
                  id: b.id,
                  labId: lab.id,
                  labName: lab.name,
                  name: b.name || lab.name,
                  city: b.address?.city || lab.address?.city || 'São Paulo',
                  state: b.address?.state || lab.address?.state || 'SP',
                  street: b.address?.street || lab.address?.street || '',
                  number: b.address?.number || lab.address?.number || '',
                  neighborhood: b.address?.neighborhood || lab.address?.neighborhood || '',
                  distance: b.distanceKm ? `${b.distanceKm.toFixed(1)} KM` : `${(Math.random() * 15 + 1).toFixed(1)} KM`,
                  available: this.getRandomDateAhead()
                });
              });
            } else {
              list.push({
                id: lab.id,
                labId: lab.id,
                labName: lab.name,
                name: lab.name,
                city: lab.address?.city || 'São Paulo',
                state: lab.address?.state || 'SP',
                street: lab.address?.street || '',
                number: lab.address?.number || '',
                neighborhood: lab.address?.neighborhood || '',
                distance: `${(Math.random() * 15 + 1).toFixed(1)} KM`,
                available: this.getRandomDateAhead()
              });
            }
          });
          this.branchesData = list;
        } else {
          this.useMockBranches();
        }
        this.filterBranches();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar laboratórios do backend:', err);
        this.useMockBranches();
        this.filterBranches();
        this.loading = false;
      }
    });
  }

  useMockBranches() {
    this.branchesData = [
      {
        id: 'branch-1',
        labId: 'lab-1',
        labName: 'Laboratório Unidade 01',
        name: 'Laboratório Unidade 01',
        city: 'São Paulo',
        state: 'SP',
        street: 'Rua Carlos Suriname Xingu',
        number: '5000',
        neighborhood: 'Centro',
        distance: '30 KM',
        available: '22/08/2026'
      },
      {
        id: 'branch-2',
        labId: 'lab-1',
        labName: 'Laboratório Unidade 01',
        name: 'Laboratório Unidade 02',
        city: 'São Paulo',
        state: 'SP',
        street: 'Av. Paulista',
        number: '1200',
        neighborhood: 'Bela Vista',
        distance: '15 KM',
        available: '23/08/2026'
      },
      {
        id: 'branch-3',
        labId: 'lab-2',
        labName: 'Laboratório Unidade 01',
        name: 'Laboratório Unidade 03',
        city: 'São Paulo',
        state: 'SP',
        street: 'Rua Augusta',
        number: '800',
        neighborhood: 'Consolação',
        distance: '8 KM',
        available: '24/08/2026'
      }
    ];
  }

  getRandomDateAhead(): string {
    const today = new Date();
    const futureDays = Math.floor(Math.random() * 10) + 1;
    const targetDate = new Date(today.getTime() + futureDays * 24 * 60 * 60 * 1000);
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const yyyy = targetDate.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  onRegionSearchClick() {
    this.currentBranchPage = 1;
    this.filterBranches();
  }

  filterBranches() {
    if (!this.regionSearchQuery.trim()) {
      this.filteredBranches = this.branchesData;
      return;
    }
    const q = this.regionSearchQuery.toLowerCase();
    this.filteredBranches = this.branchesData.filter(b => 
      b.city.toLowerCase().includes(q) ||
      b.state.toLowerCase().includes(q) ||
      b.street.toLowerCase().includes(q) ||
      b.neighborhood.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q)
    );
  }

  selectBranch(branch: any) {
    this.selectedBranchObject = branch;
    this.selectedDate = null;
    this.selectedTime = null;
    this.currentStep = 3;

    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.generateCalendar();
  }
  get currentMonthName(): string {
    return this.monthNames[this.currentMonth];
  }

  generateCalendar() {
    const year = this.currentYear;
    const month = this.currentMonth;
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        dayNum: prevMonthTotalDays - i,
        isCurrentMonth: false,
        disabled: d < today,
        date: d
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        dayNum: i,
        isCurrentMonth: true,
        disabled: d < today,
        date: d
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        disabled: d < today,
        date: d
      });
    }

    this.calendarDays = days;
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  selectDate(day: any) {
    if (day.disabled) return;
    this.selectedDate = day.date;
  }

  isDateSelected(day: any): boolean {
    if (!this.selectedDate) return false;
    return this.selectedDate.getDate() === day.date.getDate() &&
           this.selectedDate.getMonth() === day.date.getMonth() &&
           this.selectedDate.getFullYear() === day.date.getFullYear();
  }

  selectTimeSlot(time: string) {
    if (!this.selectedDate) return;
    this.selectedTime = time;
    this.currentStep = 4;
  }

  resetStep(step: number) {
    if (step < 1 || step > 4) return;
    this.currentStep = step;
    if (step <= 3) {
      this.selectedTime = null;
    }
    if (step <= 2) {
      this.selectedDate = null;
    }
    if (step <= 1) {
      this.selectedBranchObject = null;
    }
  }

  getFormattedDate(date: Date | null): string {
    if (!date) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  formatDatePayload(date: Date, time: string): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${time}:00`;
  }

  confirmAppointment() {
    if (!this.selectedExamObject || !this.selectedBranchObject || !this.selectedDate || !this.selectedTime) {
      this.bookingError = 'Por favor, certifique-se de que todos os dados do agendamento foram selecionados.';
      this.notificationService.error(this.bookingError);
      return;
    }

    this.loading = true;
    this.bookingError = null;

    const formattedDate = this.formatDatePayload(this.selectedDate, this.selectedTime);
    const patientId = this.accessService.userId || 'dummy';
    const payload = [{
      testId: this.selectedExamObject.id,
      patientId: patientId,
      scheduledFor: formattedDate,
      branchId: this.selectedBranchObject.id
    }];

    this.scheduleController.create(payload).subscribe({
      next: (res: any) => {
        this.bookingSuccess = true;
        this.loading = false;
        this.notificationService.success('Exame agendado com sucesso!');
      },
      error: (err: any) => {
        console.error('Erro ao salvar agendamento no backend:', err);
        this.bookingError = err?.message || 'Falha ao confirmar o agendamento. Por favor, tente novamente.';
        const toastMsg = this.notificationService.getErrorMsg(err);
        this.notificationService.error(toastMsg);
        this.loading = false;
      }
    });
  }

  startNewScheduling() {
    this.selectedExam = null;
    this.selectedExamObject = null;
    this.selectedBranchObject = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookingSuccess = false;
    this.bookingError = null;
    this.currentStep = 1;
  }

  openDetails(exam: any) {
    this.selectedExamForDetails = exam;
    this.detailsModal.open();
  }

  closeDetailsModal() {
    this.detailsModal.close();
    this.selectedExamForDetails = null;
  }
}

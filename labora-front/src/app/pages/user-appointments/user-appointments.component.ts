import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScheduleController } from '../../core/controllers/schedule.controller';
import { NgxCustomModalComponent } from 'ngx-custom-modal';
import { NotificationService } from '../../core/services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxCustomModalComponent],
  templateUrl: './user-appointments.component.html',
  styleUrl: './user-appointments.component.css'
})
export class UserAppointmentsComponent implements OnInit {
  @ViewChild('preparoModal') preparoModal!: any;
  @ViewChild('detailsModal') detailsModal!: any;

  appointments: any[] = [];
  filteredAppointments: any[] = [];
  selectedExamForPreparo: any = null;
  selectedAppointmentForDetails: any = null;
  
  isBrowser = false;
  loading = false;
  searchQuery = '';
  activeTab = 'todos'; // 'todos', 'agendados', 'concluidos', 'cancelados'

  // Sorting properties
  sortByField = 'date'; // 'name', 'date', 'branch'
  sortOrder = 'desc'; // 'asc', 'desc'
  sortBySelect = 'date-desc';

  constructor(
    private scheduleController: ScheduleController,
    private notificationService: NotificationService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.scheduleController.getAll().subscribe({
      next: (res: any) => {
        this.appointments = res || [];
        this.filterAppointments();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar agendamentos:', err);
        this.notificationService.error(this.notificationService.getErrorMsg(err));
        this.loading = false;
      }
    });
  }

  filterAppointments(): void {
    let list = this.appointments;

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(a => 
        (a.testName && a.testName.toLowerCase().includes(q)) ||
        (a.branchName && a.branchName.toLowerCase().includes(q))
      );
    }

    // Status / Tab filter
    if (this.activeTab === 'agendados') {
      list = list.filter(a => a.status === 'AGENDADO');
    } else if (this.activeTab === 'pendentes') {
      list = list.filter(a => a.status === 'AGUARDANDO_RESULTADOS' || ((a.status === 'CONCLUIDO' || a.status === 'REALIZADO') && !a.resultUrl));
    } else if (this.activeTab === 'concluidos') {
      list = list.filter(a => (a.status === 'CONCLUIDO' || a.status === 'REALIZADO') && a.resultUrl);
    } else if (this.activeTab === 'cancelados') {
      list = list.filter(a => a.status === 'CANCELADO');
    }

    // Sorting logic
    list = [...list].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (this.sortByField === 'name') {
        valA = a.testName || '';
        valB = b.testName || '';
      } else if (this.sortByField === 'date') {
        valA = a.scheduledFor || '';
        valB = b.scheduledFor || '';
      } else if (this.sortByField === 'branch') {
        valA = a.branchName || '';
        valB = b.branchName || '';
      }

      if (valA < valB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.filteredAppointments = list;
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.filterAppointments();
  }

  onSearch(): void {
    this.filterAppointments();
  }

  toggleSort(field: string): void {
    if (this.sortByField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortByField = field;
      this.sortOrder = field === 'date' ? 'desc' : 'asc';
    }
    this.sortBySelect = `${this.sortByField}-${this.sortOrder}`;
    this.filterAppointments();
  }

  onSortSelectChange(): void {
    if (this.sortBySelect) {
      const parts = this.sortBySelect.split('-');
      this.sortByField = parts[0];
      this.sortOrder = parts[1];
      this.filterAppointments();
    }
  }

  openPreparo(appointment: any): void {
    this.selectedExamForPreparo = {
      name: appointment.testName,
      preparationInstructions: appointment.preparationInstructions
    };
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

  openDetails(appointment: any): void {
    this.selectedAppointmentForDetails = appointment;
    if (this.isBrowser && this.detailsModal) {
      this.detailsModal.open();
    }
  }

  closeDetailsModal(): void {
    if (this.isBrowser && this.detailsModal) {
      this.detailsModal.close();
    }
    this.selectedAppointmentForDetails = null;
  }

  formatAddress(address: any): string {
    if (!address) return 'Endereço não disponível';
    const parts = [];
    if (address.street) {
      parts.push(`${address.street}${address.number ? ', ' + address.number : ''}`);
    }
    if (address.neighborhood) {
      parts.push(address.neighborhood);
    }
    if (address.city) {
      parts.push(`${address.city}${address.state ? '/' + address.state : ''}`);
    }
    return parts.join(' - ');
  }

  reschedule(appointment: any): void {
    this.router.navigate(['/schedule'], { queryParams: { reschedule: appointment.id, exam: appointment.testName } });
  }

  confirmCancel(appointment: any): void {
    Swal.fire({
      title: 'Cancelar agendamento?',
      text: `Deseja realmente cancelar o agendamento de ${appointment.testName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e01a53',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Voltar',
      customClass: {
        confirmButton: 'btn btn-primary px-4 py-2',
        cancelButton: 'btn btn-outline-secondary px-4 py-2 ml-2'
      },
      buttonsStyling: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.cancelAppointment(appointment.id);
      }
    });
  }

  cancelAppointment(id: string): void {
    this.loading = true;
    this.scheduleController.cancel(id).subscribe({
      next: () => {
        this.notificationService.success('Agendamento cancelado com sucesso.');
        this.loadAppointments();
      },
      error: (err: any) => {
        console.error('Erro ao cancelar agendamento:', err);
        this.notificationService.error(this.notificationService.getErrorMsg(err));
        this.loading = false;
      }
    });
  }

  downloadResult(url: string): void {
    if (url && this.isBrowser) {
      window.open(url, '_blank');
    }
  }

  getStatusBadgeClass(app: any): string {
    if ((app.status === 'CONCLUIDO' || app.status === 'REALIZADO') && !app.resultUrl) {
      return 'bg-warning/10 text-warning';
    }
    switch (app.status) {
      case 'AGENDADO':
        return 'bg-info/10 text-info';
      case 'AGUARDANDO_RESULTADOS':
        return 'bg-warning/10 text-warning';
      case 'CONCLUIDO':
      case 'REALIZADO':
        return 'bg-success/10 text-success';
      case 'CANCELADO':
        return 'bg-danger/10 text-danger';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  }

  getStatusLabel(app: any): string {
    if ((app.status === 'CONCLUIDO' || app.status === 'REALIZADO') && !app.resultUrl) {
      return 'Resultado Pendente';
    }
    switch (app.status) {
      case 'AGENDADO':
        return 'Confirmado';
      case 'AGUARDANDO_RESULTADOS':
        return 'Aguardando Resultados';
      case 'CONCLUIDO':
      case 'REALIZADO':
        return 'Concluído';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return app.status;
    }
  }

  formatDate(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    try {
      const parts = dateTimeStr.split('T');
      const datePart = parts[0];
      const timePart = parts[1] ? parts[1].substring(0, 5) : '';
      
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year} às ${timePart}h`;
    } catch (e) {
      return dateTimeStr;
    }
  }
}

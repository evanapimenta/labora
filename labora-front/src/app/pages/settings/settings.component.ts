import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserController } from '../../core/controllers/user.controller';
import { PatientController } from '../../core/controllers/patient.controller';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
  userId = '';
  theme = 'light';
  sidebarCollapsed = false;
  loading = false;
  saving = false;

  originalTheme = 'light';
  originalSidebarCollapsed = false;

  constructor(
    private userController: UserController,
    private patientController: PatientController,
    private notificationService: NotificationService,
    private storeData: Store<any>
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  getDecodedToken(): any {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const accessStr = localStorage.getItem('access');
    if (!accessStr) return null;
    try {
      const accessObj = JSON.parse(accessStr);
      const token = accessObj.accessToken;
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Error decoding token in settings page:', e);
      return null;
    }
  }

  loadSettings() {
    const tokenPayload = this.getDecodedToken();
    if (!tokenPayload || !tokenPayload.id) {
      this.notificationService.error('Sessão expirada ou inválida. Por favor, faça login novamente.');
      return;
    }

    this.userId = tokenPayload.id;
    this.loading = true;

    // Tentar carregar como paciente primeiro
    this.patientController.getById(this.userId).subscribe({
      next: (patient: any) => {
        const settings = patient.userInfoDTO?.settings;
        this.applyLocalState(settings);
        this.loading = false;
      },
      error: (err: any) => {
        console.warn('Paciente não encontrado nas configurações, tentando usuário genérico:', err);
        // Tentar carregar usuário genérico
        this.userController.getById(this.userId).subscribe({
          next: (user: any) => {
            this.applyLocalState(user.settings);
            this.loading = false;
          },
          error: (userErr: any) => {
            console.error('Erro ao carregar usuário em configurações:', userErr);
            this.notificationService.error('Erro ao carregar configurações do usuário.');
            this.loading = false;
          }
        });
      }
    });
  }

  applyLocalState(settings: any) {
    if (settings) {
      this.theme = settings.theme || 'light';
      this.sidebarCollapsed = settings.sidebarCollapsed !== undefined ? settings.sidebarCollapsed : false;
    } else {
      this.theme = 'light';
      this.sidebarCollapsed = false;
    }
    this.originalTheme = this.theme;
    this.originalSidebarCollapsed = this.sidebarCollapsed;
  }

  onThemeChange() {
    this.storeData.dispatch({ type: 'toggleTheme', payload: this.theme });
  }

  onSidebarChange() {
    this.storeData.dispatch({ type: 'toggleSidebar', payload: !this.sidebarCollapsed });
  }

  saveSettings() {
    this.saving = true;

    const newSettings = {
      theme: this.theme,
      sidebarCollapsed: this.sidebarCollapsed
    };

    this.userController.updateSettings(this.userId, newSettings).subscribe({
      next: (resp: any) => {
        this.saving = false;
        this.notificationService.success('Configurações salvas com sucesso!');
        
        this.originalTheme = this.theme;
        this.originalSidebarCollapsed = this.sidebarCollapsed;

        // Aplicar as configurações imediatamente na tela (NgRx store)
        this.storeData.dispatch({ type: 'toggleTheme', payload: this.theme });
        this.storeData.dispatch({ type: 'toggleSidebar', payload: !this.sidebarCollapsed });
      },
      error: (err: any) => {
        this.saving = false;
        const msg = this.notificationService.getErrorMsg(err);
        this.notificationService.error(msg || 'Erro ao salvar configurações.');
      }
    });
  }

  ngOnDestroy(): void {
    // Se saiu da tela sem salvar as alterações, reverte
    if (this.theme !== this.originalTheme) {
      this.storeData.dispatch({ type: 'toggleTheme', payload: this.originalTheme });
    }
    if (this.sidebarCollapsed !== this.originalSidebarCollapsed) {
      this.storeData.dispatch({ type: 'toggleSidebar', payload: !this.originalSidebarCollapsed });
    }
  }
}

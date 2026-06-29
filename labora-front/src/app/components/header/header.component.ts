import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IconMenuComponent } from '../../icons/icon-menu';
import { IconUserComponent } from '../../icons/icon-user';
import { SearchInputComponent } from '../search-input/search-input.component';
import { environment } from '../../../../environment';
import { PatientController } from '../../core/controllers/patient.controller';
import { UserController } from '../../core/controllers/user.controller';
import { Store } from '@ngrx/store';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconMenuComponent, IconUserComponent, SearchInputComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  
  logo = environment.logo;
  isUserDropdownOpen = false;
  
  userProfile: UserProfile = {
    name: 'Carregando...',
    email: '',
    role: '',
    avatar: '/assets/images/profile.png'
  };

  store: any;

  constructor(
    private router: Router,
    private patientController: PatientController,
    private userController: UserController,
    public storeData: Store<any>
  ) {
    this.initStore();
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
      });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const tokenPayload = this.getDecodedToken();
    if (!tokenPayload || !tokenPayload.id) {
      this.userProfile.name = 'Não conectado';
      return;
    }

    const userId = tokenPayload.id;
    const tokenRole = tokenPayload.role || '';
    this.userProfile.role = this.mapRole(tokenRole);

    // Tentar carregar dados do paciente
    this.patientController.getById(userId).subscribe({
      next: (patient: any) => {
        this.userProfile.name = patient.userInfoDTO?.name || 'Sem nome';
        this.userProfile.email = patient.userInfoDTO?.email || '';
        this.userProfile.avatar = this.getAvatarUrl(patient.userInfoDTO?.imagePathUrl);
        this.applySettings(patient.userInfoDTO?.settings);
      },
      error: (err: any) => {
        console.warn('Erro ao carregar paciente no header, tentando usuário genérico:', err);
        // Tentar carregar dados do usuário genérico (Administradores)
        this.userController.getById(userId).subscribe({
          next: (user: any) => {
            this.userProfile.name = user.name || 'Sem nome';
            this.userProfile.email = user.email || '';
            this.userProfile.avatar = this.getAvatarUrl(user.imagePathUrl);
            this.applySettings(user.settings);
          },
          error: (userErr: any) => {
            console.error('Erro ao carregar usuário no header:', userErr);
            this.userProfile.name = 'Erro ao carregar';
          }
        });
      }
    });
  }

  applySettings(settings: any) {
    if (settings) {
      if (settings.theme) {
        this.storeData.dispatch({ type: 'toggleTheme', payload: settings.theme });
      }
      if (settings.sidebarCollapsed !== undefined) {
        // sidebar = true significa sidebarCollapsed = false, logo passamos !sidebarCollapsed
        this.storeData.dispatch({ type: 'toggleSidebar', payload: !settings.sidebarCollapsed });
      }
    }
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
      console.error('Error decoding token in header:', e);
      return null;
    }
  }

  mapRole(role: string): string {
    if (!role) return 'Usuário';
    if (role === 'PATIENT') return 'Paciente';
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'SUPER_ADMIN') return 'Super Administrador';
    return role;
  }

  getAvatarUrl(imagePath: string | null | undefined): string {
    if (imagePath) {
      if (imagePath.startsWith('/images/profile/')) {
        return `http://localhost:8080${imagePath}`;
      }
      return imagePath;
    }
    return '/assets/images/profile.png';
  }

  getUserInitials(): string {
    if (!this.userProfile.name || this.userProfile.name === 'Carregando...') return '?';
    const parts = this.userProfile.name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  onSidebarToggle() {
    this.sidebarToggle.emit();
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  logout() {
    localStorage.removeItem('access');
    this.router.navigate(['/sign-in']);
    this.isUserDropdownOpen = false;
  }

  onSearchChange(searchTerm: string) {
    console.log('Search term changed:', searchTerm);
  }

  onSearch(searchTerm: string) {
    console.log('Search executed:', searchTerm);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const userDropdown = target.closest('[data-user-dropdown]');
    
    if (!userDropdown && this.isUserDropdownOpen) {
      this.isUserDropdownOpen = false;
    }
  }
}

// src/app/layouts/app-layout/app-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-layout',
  templateUrl: './app.html',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],

})
export class AppLayoutComponent {
  sidebarCollapsed = false;
  showTopButton = false;
  store: any;

  constructor(public storeData: Store<any>) {
    this.initStore();
  }

  async initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
        this.sidebarCollapsed = !d.sidebar;
      });
  }

  onSidebarToggle() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.storeData.dispatch({ type: 'toggleSidebar' });
  }

  goToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

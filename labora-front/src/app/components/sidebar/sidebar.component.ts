import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { slideDownUp } from '../../shared/animations';
import { AccessService } from '../../core/services/access.service';
import { MENU_ITEMS, MenuItem, ICON_REGISTRY } from '../../layouts/menu-items';
import { IconUserComponent } from '../../icons/icon-user';
import { IconCaretsDownComponent } from '../../icons/icon-carets-down';
import { environment } from '../../../../environment';


@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, IconCaretsDownComponent],
    templateUrl: './sidebar.component.html',
    animations: [slideDownUp],
})
export class SidebarComponent implements OnInit, AfterViewInit {
    active = false;
    store: any;
    activeDropdown: string[] = [];
    parentDropdown: string = '';
    menuItems: MenuItem[] = [];
    iconMap = ICON_REGISTRY;
    logo = environment.logo;

    constructor(
        public storeData: Store<any>,
        public router: Router,
        private accessService: AccessService,
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

    hasAccess(gruposNe: number[]) {
        return gruposNe.some((grupo) => this.accessService.access.perfis.some((p: any) => p.tiposUsuarioId == grupo));
    }

    tiposUsuarioId: any;
    data: any;

    ngOnInit() {
        this.setActiveDropdown();
        
        // Verificar se estamos no browser antes de acessar localStorage
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const dataString = localStorage.getItem('access');
            if (dataString !== null) {
                this.data = JSON.parse(dataString);
                this.tiposUsuarioId = this.data.tiposUsuarioId;
            }
        }
        
        this.menuItems = this.getFilteredMenu();
    }

    getFilteredMenu(): MenuItem[] {
        return MENU_ITEMS;
    }



    ngAfterViewInit(): void {
        this.getFilteredMenu();
    }

    setActiveDropdown() {
        // Verificar se estamos no browser (não no SSR)
        if (typeof document !== 'undefined' && typeof window !== 'undefined') {
            const selector = document.querySelector('.sidebar ul a[routerLink="' + window.location.pathname + '"]');
            if (selector) {
                selector.classList.add('active');
                const ul: any = selector.closest('ul.sub-menu');
                if (ul) {
                    let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                    if (ele.length) {
                        ele = ele[0];
                        setTimeout(() => {
                            ele.click();
                        });
                    }
                }
            }
        }
    }

    get access() {
        return this.accessService.access;
    }

    getIconComponent(iconName: string | undefined) {
        if (!iconName) {
            return null;
        }
        return this.iconMap[iconName] || IconUserComponent;
    }

    toggleMobileMenu() {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            this.storeData.dispatch({ type: 'toggleSidebar' });
        }
    }

    toggleAccordion(name: string, parent?: string) {
        if (this.activeDropdown.includes(name)) {
            this.activeDropdown = this.activeDropdown.filter((d) => d !== name);
        } else {
            this.activeDropdown.push(name);
        }
    }
}

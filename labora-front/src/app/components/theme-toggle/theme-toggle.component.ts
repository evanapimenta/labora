import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="cycleTheme()"
      [title]="getTitle()"
      [class]="'group relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ' + variantClass">
      <!-- Light icon -->
      <svg *ngIf="store?.theme === 'light'" class="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5" />
        <path d="M12 2V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M12 20V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M4 12L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M22 12L20 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path opacity="0.5" d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path opacity="0.5" d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path opacity="0.5" d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path opacity="0.5" d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>

      <!-- Dark icon -->
      <svg *ngIf="store?.theme === 'dark'" class="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703L12.531 3.57467ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447Z"
          fill="currentColor"
        />
      </svg>

      <!-- System icon -->
      <svg *ngIf="store?.theme === 'system'" class="h-5 w-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 9C3 6.17157 3 4.75736 3.87868 3.87868C4.75736 3 6.17157 3 9 3H15C17.8284 3 19.2426 3 20.1213 3.87868C21 4.75736 21 6.17157 21 9V14C21 15.8856 21 16.8284 20.4142 17.4142C19.8284 18 18.8856 18 17 18H7C5.11438 18 4.17157 18 3.58579 17.4142C3 16.8284 3 15.8856 3 14V9Z"
          stroke="currentColor"
          stroke-width="1.5"
        />
        <path opacity="0.5" d="M22 21H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path opacity="0.5" d="M15 15H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
  `,
})
export class ThemeToggleComponent implements OnInit {
  /**
   * Visual variant:
   *  - 'glass'  : translucent background, ideal sobre cards/auth
   *  - 'subtle' : background neutro, ideal sobre header
   */
  @Input() variant: 'glass' | 'subtle' = 'subtle';

  store: any;

  get variantClass(): string {
    if (this.variant === 'glass') {
      return 'bg-white/40 hover:bg-white/60 text-darkPurple shadow-sm hover:shadow-md backdrop-blur-md ring-1 ring-white/40 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:ring-white/10';
    }
    return 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300';
  }

  constructor(public storeData: Store<any>) {
    this.storeData
      .select((d: any) => d.index)
      .subscribe((d: any) => {
        this.store = d;
      });
  }

  ngOnInit(): void {
    // Garante que o estado refletido na UI siga o valor armazenado em localStorage,
    // mesmo quando carregamos diretamente nas telas de auth.
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('theme');
      if (saved && saved !== this.store?.theme) {
        this.storeData.dispatch({ type: 'toggleTheme', payload: saved });
      } else if (this.store?.theme) {
        // Reaplica o tema atual para garantir a classe `dark` no body
        this.storeData.dispatch({ type: 'toggleTheme', payload: this.store.theme });
      }
    }
  }

  cycleTheme(): void {
    const current = this.store?.theme || 'light';
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
    this.storeData.dispatch({ type: 'toggleTheme', payload: next });
  }

  getTitle(): string {
    const current = this.store?.theme;
    if (current === 'light') return 'Mudar para Modo Escuro';
    if (current === 'dark') return 'Mudar para Modo Automático';
    return 'Mudar para Modo Claro';
  }
}

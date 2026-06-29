import { ENUM_PAGES } from '../core/helpers/enums';
import { IconUserComponent } from '../icons/icon-user';
import { IconMailComponent } from '../icons/icon-mail';
import { IconLockDotsComponent } from '../icons/icon-lock-dots';
import { IconCaretsDownComponent } from '../icons/icon-carets-down';
import { IconHomeComponent } from '../icons/icon-home';
import { IconFileComponent } from '../icons/icon-file';
import { IconLaboratoryComponent } from '../icons/icon-laboratory';
import { IconSearchComponent } from '../icons/icon-search';

export interface MenuItem {
  link: string;
  keys: string[];
  subItems?: MenuItem[];
  icon?: string;
  label: string;
}

export const ICON_REGISTRY: { [key: string]: any } = {
  'icon-user': IconUserComponent,
  'icon-mail': IconMailComponent,
  'icon-lock-dots': IconLockDotsComponent,
  'icon-carets-down': IconCaretsDownComponent,
  'icon-home': IconHomeComponent,
  'icon-file': IconFileComponent,
  'icon-laboratory': IconLaboratoryComponent,
  'icon-search': IconSearchComponent,
};

export const MENU_ITEMS: MenuItem[] = [
  {
    link: '#',
    keys: [ENUM_PAGES.home],
    label: 'Início',
    subItems: [
      {
        link: '/',
        keys: [ENUM_PAGES.home],
        icon: 'icon-home',
        label: 'Bem-vindo',
      },
      {
        link: '/schedule',
        keys: [ENUM_PAGES.schedule],
        icon: 'icon-search',
        label: 'Agendar',
      },
    ],
  },
  {
    link: '#',
    keys: [ENUM_PAGES.user],
    label: 'Meu Espaço',
    subItems: [
      {
        link: '/profile',
        keys: [ENUM_PAGES.profile],
        icon: 'icon-user',
        label: 'Perfil',
      },
      {
        link: '/exams',
        keys: [ENUM_PAGES.exams],
        icon: 'icon-file',
        label: 'Exames',
      },
      {
        link: '/appointments',
        keys: [ENUM_PAGES.appointments],
        icon: 'icon-laboratory',
        label: 'Meus Agendamentos',
      },
    ],
  },
];

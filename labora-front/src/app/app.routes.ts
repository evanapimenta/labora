import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';
import { RegisterPatientComponent } from './pages/auth/register-patient/register-patient.component';
import { AppLayoutComponent } from './layouts/app/app';
import { UserExamsComponent } from './pages/user-exams/user-exams.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UserAppointmentsComponent } from './pages/user-appointments/user-appointments.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: AppLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: HomeComponent,
                pathMatch: 'full'
            },
            {   
                path: 'profile',
                component: UserProfileComponent
            },
            {
                path: 'schedule',
                component: ScheduleComponent
            },
            {
                path: 'exams',
                component: UserExamsComponent
            },
            {
                path: 'appointments',
                component: UserAppointmentsComponent
            },
            {
                path: 'settings',
                component: SettingsComponent
            }
        ]
    },
    {
        path: 'sign-in',
        component: SignInComponent
    },
    {
        path: 'login/callback',
        loadComponent: () => import('./pages/auth/login-callback/login-callback.component').then(m => m.LoginCallbackComponent)
    },
    {
        path: 'sign-up',
        component: SignUpComponent
    },
    {
        path: 'verify-email',
        component: VerifyEmailComponent
    },
    {
        path: 'register-patient',
        component: RegisterPatientComponent
    }
];

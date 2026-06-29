import { Component } from '@angular/core';
import { IconLockDotsComponent } from '../../../icons/icon-lock-dots';
import { IconMailComponent } from '../../../icons/icon-mail';
import { Router, RouterLink } from '@angular/router';
import { IconUserComponent } from '../../../icons/icon-user';
import { AuthController } from '../../../core/controllers/auth.controller';
import { FormControl,ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeToggleComponent } from '../../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink ,IconMailComponent, IconLockDotsComponent, IconUserComponent, ThemeToggleComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  constructor(
    private authController: AuthController, 
    private router: Router,
    private notificationService: NotificationService
  ){}
  
    form!: UntypedFormGroup;
    ngOnInit(): void {
      this.createForm();
    }
  
    createForm = () => {
      this.form = new UntypedFormGroup({
        name: new FormControl(null, [Validators.required]),
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [Validators.required]),
        confirmPassword: new FormControl(null, [Validators.required]),
      })
   }
  
   register = () => {
    if (this.form.invalid) {
      this.notificationService.error('Por favor, preencha todos os campos do cadastro corretamente.');
      return;
    }
    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.notificationService.error('As senhas digitadas não coincidem.');
      return;
    }
    const email = this.form.value.email;
    this.authController.register(this.form.value).then((resp: any) => {
      this.notificationService.success('Cadastro inicial realizado com sucesso! Verifique seu e-mail para ativar a conta.');
      this.router.navigate(['/verify-email'], { queryParams: { email } });
    }).catch((err: any) => {
      const errorMsg = this.notificationService.getErrorMsg(err);
      this.notificationService.error(errorMsg);
    });
   }
}

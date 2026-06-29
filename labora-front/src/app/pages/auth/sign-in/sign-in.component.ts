import { Component } from '@angular/core';
import { IconMailComponent } from '../../../icons/icon-mail';
import { IconLockDotsComponent } from '../../../icons/icon-lock-dots';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthController } from '../../../core/controllers/auth.controller';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeToggleComponent } from '../../../components/theme-toggle/theme-toggle.component';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [RouterLink ,IconMailComponent, IconLockDotsComponent, ReactiveFormsModule, FormsModule, ThemeToggleComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  constructor(
    private authController: AuthController, 
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ){}

  form!: UntypedFormGroup;
  ngOnInit(): void {
    this.createForm();
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.notificationService.error(params['error']);
      }
    });
  }

  createForm = () => {
    this.form = new UntypedFormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    })
 }

 login = () => {
  if (this.form.invalid) {
    this.notificationService.error('Por favor, preencha o e-mail e a senha corretamente.');
    return;
  }
  this.authController.login(this.form.value).then((resp: any) => {
    this.notificationService.success('Conectado com sucesso!');
    this.router.navigate(['/']);
  }).catch((err: any) => {
    const errorMsg = this.notificationService.getErrorMsg(err);
    this.notificationService.error(errorMsg);
  });
 }

  loginWithGoogle = () => {
    window.location.href = environment.api + '/login/google';
  }
}
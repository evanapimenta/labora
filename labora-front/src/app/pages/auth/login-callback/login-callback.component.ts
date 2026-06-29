import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login-callback',
  standalone: true,
  templateUrl: './login-callback.component.html',
})
export class LoginCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const accessToken = params['access_token'];
      const refreshToken = params['refresh_token'];

      if (accessToken && refreshToken) {
        const tokenData = {
          accessToken: accessToken,
          refreshToken: refreshToken
        };

        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('access', JSON.stringify(tokenData));
          this.notificationService.success('Conectado com o Google com sucesso!');
          this.router.navigate(['/']);
        }
      } else {
        if (typeof window !== 'undefined') {
          this.notificationService.error('Falha ao autenticar com o Google. Tokens não encontrados.');
          this.router.navigate(['/sign-in']);
        }
      }
    });
  }
}

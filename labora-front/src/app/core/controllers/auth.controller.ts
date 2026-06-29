import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class AuthController {
    constructor(private apiService: ApiService) { }

    login = (data: any) => {
        return new Promise((resolve, reject) => {
            this.apiService.post(`login`, data).subscribe({
                next: (resp: any) => {
                    localStorage.setItem('access', JSON.stringify(resp));
                    resolve(resp);
                },
                error: (error) => {
                    reject(error);
                }
            })
        })
    };

    register = (data: any) => {
        return new Promise((resolve, reject) => {
            this.apiService.post(`users`, data).subscribe({    
                next: (resp: any) => {
                    resolve(resp);
                },
                error: (error) => {
                    reject(error);
                }
            })
        })
    };


    logout = () => { };
}

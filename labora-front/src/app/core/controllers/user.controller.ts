import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class UserController {
    constructor(private apiService: ApiService) { }

    getById = (id: string) => {
        return this.apiService.get(`/users/${id}`);
    }

    update = (id: string, data: any) => {
        return this.apiService.put(`/users/${id}`, data);
    }

    changePassword = (id: string, data: any) => {
        return this.apiService.put(`/users/${id}/change-password`, data);
    }

    verifyAccount = (code: string) => {
        return this.apiService.get(`/users/verify-account?code=${code}`, undefined, false);
    }

    updateSettings = (id: string, settings: any) => {
        return this.apiService.put(`/users/${id}/settings`, settings);
    }
}

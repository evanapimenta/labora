import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class PatientController {
    constructor(private apiService: ApiService) { }

    getById = (id: string) => {
        return this.apiService.get(`/patients/${id}`);
    }

    update = (id: string, data: any) => {
        return this.apiService.put(`/patients/${id}`, data);
    }

    create = (data: any) => {
        return this.apiService.post('patients', data);
    }
}

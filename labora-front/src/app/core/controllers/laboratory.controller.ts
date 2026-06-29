import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class LaboratoryController {
    constructor(private apiService: ApiService) { }

    getAll = () => {
        return this.apiService.get(`/labs`);
    }
}

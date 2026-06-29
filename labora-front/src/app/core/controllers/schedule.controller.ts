import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class ScheduleController {
    constructor(private apiService: ApiService) { }

    create = (data: any) => {
        return this.apiService.post('schedule', data);
    }

    getScheduled = () => {
        return this.apiService.get('/schedule/me');
    }

    getCompleted = () => {
        return this.apiService.get('/schedule/me/completed');
    }

    getAll = () => {
        return this.apiService.get('/schedule/me/all');
    }

    reschedule = (id: string, scheduledFor: string) => {
        return this.apiService.put(`/schedule/${id}`, { scheduledFor });
    }

    cancel = (id: string) => {
        return this.apiService.delete(`/schedule/${id}`);
    }
}

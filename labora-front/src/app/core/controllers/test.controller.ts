import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

@Injectable({
    providedIn: 'root',
})
export class TestController {
    constructor(private apiService: ApiService) { }

    getAll = (page: number = 0, size: number = 6, search: string = '', category: string = '') => {
        let url = `/tests?page=${page}&size=${size}`;
        if (search.trim()) {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }
        if (category.trim()) {
            url += `&category=${encodeURIComponent(category.trim())}`;
        }
        return this.apiService.get(url);
    }

    getCategories = () => {
        return this.apiService.get('/tests/categories');
    }
}

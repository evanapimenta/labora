import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../../environment'

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private _urlService: string;
    private timeout = 300000;

    get access() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const access = localStorage.getItem('access');
            return access ? JSON.parse(access) : null;
        }
        return null;
    }

    get accessToken(): string {
        return this.access?.accessToken;
    }

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private router: Router
    ) {
        this._urlService = environment.api;
    }

    get(url: string, params?: HttpParams, auth: boolean = true): Observable<any> {
        return this._httpClient
            .get<any>(`${this._urlService}${url}`, {
                ...this.getHeader(auth, true),
                params,
            })
            .pipe(timeout(this.timeout), catchError(this.catchError));
    }

    post(url: string, data: any, auth: boolean = true): Observable<any> {
        return this._httpClient
            .post<any>(`${this._urlService}/${url}`, data, this.getHeader(auth, true))
            .pipe(timeout(this.timeout), catchError(this.catchError));
    }

    put(url: string, data: any, auth: boolean = true): Observable<any> {
        return this._httpClient
            .put<any>(`${this._urlService}${url}`, data, this.getHeader(auth, true))
            .pipe(timeout(this.timeout), catchError(this.catchError));
    }

    delete(url: string, auth: boolean = true): Observable<any> {
        return this._httpClient
            .delete<any>(`${this._urlService}${url}`, this.getHeader(auth, false))
            .pipe(timeout(this.timeout), catchError(this.catchError));
    }

    private getHeader(auth: boolean, isJson: boolean) {
        let hh: any = {};
        if (this.accessToken && auth) {
            const auth = this.accessToken;

            hh = {
                ...hh,
                authorization: `Bearer ${auth}`,
            };
        }
        if (isJson) {
            hh = {
                ...hh,
                'Content-Type': 'application/json',
            };
        }

        return { headers: new HttpHeaders(hh) };
    }

    private catchError = (error: any) => {
        if (error.status == 401) {
            // this.storageService.removeItem('access');
            this.router.navigate(['sign-in']);
        }

        if (error.status == 400 || (error.error != null && error.error.message != null)) {
            const e = error?.error;
            // this.messageService.error('Erro', e?.message);
            return throwError(e);
        }

        throw error;
    };
}
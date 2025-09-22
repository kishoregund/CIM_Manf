import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
    providedIn: 'root'
})

export class TenantService {

    constructor(
        private http: HttpClient,
        private environment: EnvService
    ) { }

    GetAll() {
        return this.http.get(`${this.environment.apiUrl}/Tenants/all`)
    }

    Save = (data) => {
        return this.http.post(`${this.environment.apiUrl}/Tenants/add`, data)
    }

    GetById(id: string) {
        return this.http.get(`${this.environment.apiUrl}/Tenants/${id}`)
    }

    // Delete(id: string) {
    //     return this.http.delete(`${this.environment.apiUrl}/AppBasics/BUdelete/${id}`)
    // }

    Update( data: any) {
        return this.http.put(`${this.environment.apiUrl}/Tenants/upgrade`, data)
    }

    Activate( data: any) {
        return this.http.put(`${this.environment.apiUrl}/Tenants/${data.TenantId}/activate`, data)
    }

    Deactivate(data: any) {
        return this.http.put(`${this.environment.apiUrl}/Tenants/${data.TenantId}/deactivate`, data)
    }
}

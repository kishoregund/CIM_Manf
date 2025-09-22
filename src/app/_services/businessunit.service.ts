import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
    providedIn: 'root'
})
export class BusinessUnitService {

    constructor(
        private http: HttpClient,
        private environment: EnvService
    ) { }

    GetAll() {
        return this.http.get(`${this.environment.apiUrl}/AppBasics/BUall`)
    }

    Save = (data) => {
        return this.http.post(`${this.environment.apiUrl}/AppBasics/BUadd`, data)
    }

    GetById(id: string) {
        return this.http.get(`${this.environment.apiUrl}/AppBasics/BUby-id/${id}`)
    }

    // GetByCompanyId() {
    //     return this.http.get(`${this.environment.apiUrl}/BusinessUnits/GetByCompanyId`)
    // }
    // GetByCustomCompanyId(id) {
    //     return this.http.get(`${this.environment.apiUrl}/BusinessUnits/GetByCompanyId/${id}`)
    // }


    Delete(id: string) {
        return this.http.delete(`${this.environment.apiUrl}/AppBasics/BUdelete/${id}`)
    }

    Update(id: string, data: any) {
        return this.http.put(`${this.environment.apiUrl}/AppBasics/BUupdate`, data)
    }
}

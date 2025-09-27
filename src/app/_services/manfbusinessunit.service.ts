import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
    providedIn: 'root'
})
export class ManfBusinessUnitService {

    constructor(
        private http: HttpClient,
        private environment: EnvService
    ) { }

    GetAll() {
        return this.http.get(`${this.environment.apiUrl}/AppBasics/MBUall`)
    }

    Save = (data) => {
        return this.http.post(`${this.environment.apiUrl}/AppBasics/MBUadd`, data)
    }

    GetById(id: string) {
        return this.http.get(`${this.environment.apiUrl}/AppBasics/MBUby-id/${id}`)
    }

    // GetByCompanyId() {
    //     return this.http.get(`${this.environment.apiUrl}/BusinessUnits/GetByCompanyId`)
    // }
    // GetByCustomCompanyId(id) {
    //     return this.http.get(`${this.environment.apiUrl}/BusinessUnits/GetByCompanyId/${id}`)
    // }


    Delete(id: string) {
        return this.http.delete(`${this.environment.apiUrl}/AppBasics/MBUdelete/${id}`)
    }

    Update(id: string, data: any) {
        return this.http.put(`${this.environment.apiUrl}/AppBasics/MBUupdate`, data)
    }
}

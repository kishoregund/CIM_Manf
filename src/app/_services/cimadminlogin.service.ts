import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
    providedIn: 'root'
})
export class CIMAdminLoginService {

    constructor(
        private http: HttpClient,
        private environment: EnvService
    ) { }

    Adminlogin(login) {
        return this.http.post(`${this.environment.apiUrl}/Tokens/login`, login);       
      }
}

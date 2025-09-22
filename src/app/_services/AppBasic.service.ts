import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class AppBasicService {

  constructor(
    private http: HttpClient,
    private environment: EnvService
  ) { }


  GetModalData = () => this.http.get(`${this.environment.apiUrl}/AppBasics/GetModalData`)


  // GetAllCompany = () => {
  //   return this.http.get(`${this.environment.apiUrl}/AppBasic`)
  // }

  // Save = (data) => {
  //   return this.http.post(`${this.environment.apiUrl}/Company`, data)
  // }

  // GetCompanyById(id: string) {
  //   return this.http.get(`${this.environment.apiUrl}/Company/${id}`)
  // }

  // DeleteCompany(id: string) {
  //   return this.http.delete(`${this.environment.apiUrl}/Company/${id}`)
  // }


  // Update(id: string, data: any) {
  //   return this.http.put(`${this.environment.apiUrl}/Company/${id}`, data)
  // }

}

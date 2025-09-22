import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(
    private http: HttpClient,
    private environment: EnvService
  ) { }

  GetAll() {
    return this.http.get(`${this.environment.apiUrl}/AppBasics/BRall`)
  }

  GetById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/AppBasics/BRby-id/${id}`)
  }

  // GetByCompanyId() {
  //   return this.http.get(`${this.environment.apiUrl}/Brands/GetByCompanyId`)
  // }

  // GetByCustomCompanyId(id) {
  //   return this.http.get(`${this.environment.apiUrl}/Brands/GetByCompanyId/${id}`)
  // }

  GetByBU(id) {
    return this.http.get(`${this.environment.apiUrl}/AppBasics/BRByBUall/${id}`)
  }
  GetByBUs(id) {
    return this.http.get(`${this.environment.apiUrl}/AppBasics/BRByBUs/${id}`)
  }
  
  Delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/AppBasics/BRdelete/${id}`)
  }

  Update(id: string, data: any) {
    return this.http.put(`${this.environment.apiUrl}/AppBasics/BRupdate`, data)
  }

  Save = (brand) => this.http.post(`${this.environment.apiUrl}/AppBasics/BRadd`, brand)

}

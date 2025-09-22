import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class EngdashboardService {

  constructor(
    private http: HttpClient,
    private environment: EnvService
  ) { }


  GetCompSerReq(date: string) {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/engserreq/${date}`)
  }

  GetSPCon(date: string) {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/sparescon/${date}`)
  }

  GetSPRecomm(date: string) {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/sparesrecom/${date}`)
  }
  
  GetTravelExpenses(date: string) {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/engtravelexp/${date}`)
  }
}

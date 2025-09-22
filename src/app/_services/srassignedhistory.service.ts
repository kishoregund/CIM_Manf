import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ticketsAssignedHistory } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class SRAssignedHistoryService {
  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
  }

  save(ticket: ticketsAssignedHistory) {
    return this.http.post(`${this.environment.apiUrl}/ServiceRequests/AHadd`, ticket);
  }

  getAll(srId:string) {
    return this.http.get<ticketsAssignedHistory[]>(`${this.environment.apiUrl}/ServiceRequests/AHall/${srId}`);
  }

  getById(id: string) {
    return this.http.get<ticketsAssignedHistory>(`${this.environment.apiUrl}/ServiceRequests/AHby-id/${id}`);
  }
  
  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/ServiceRequests/AHupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/ServiceRequests/AHdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}

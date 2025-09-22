import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class BankdetailsService {

  constructor(private http: HttpClient, private environment: EnvService,) { }


  save(model) {
    return this.http.post(`${this.environment.apiUrl}/Travel/BDadd`, model);
  }

  getAll() {
    return this.http.get(`${this.environment.apiUrl}/Travel`);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Travel/BDby-id/${id}`);
  }

  getByContactId(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Travel/BDbyconid/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Travel/BDupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Travel/BDdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}

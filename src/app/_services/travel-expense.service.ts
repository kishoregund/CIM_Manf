import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';
import { BUBrandModel } from '../_newmodels/BUBrandModel';

@Injectable({
  providedIn: 'root'
})
export class TravelExpenseService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }


  save(model) {
    return this.http.post(`${this.environment.apiUrl}/Travel/TEadd`, model);
  }

  getAll(buBrandModel) {
    return this.http.post(`${this.environment.apiUrl}/Travel/TEall`, buBrandModel);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Travel/TEby-id/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Travel/TEupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Travel/TEdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}

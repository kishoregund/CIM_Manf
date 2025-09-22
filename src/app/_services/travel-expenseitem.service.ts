import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class TravelExpenseitemService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }


  save(model) {
    return this.http.post(`${this.environment.apiUrl}/Travel/TEIadd`, model);
  }

  getAll(expId:string) {
    return this.http.get(`${this.environment.apiUrl}/Travel/TEIall/${expId}`);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Travel/TEIby-id/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Travel/TEIupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Travel/TEIdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}

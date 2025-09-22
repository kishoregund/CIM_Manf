import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class TravelinvoiceService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }


  save(model) {
    return this.http.post(`${this.environment.apiUrl}/Travel/TIadd`, model);
  }

  getAll(buBrandModel) {
    return this.http.post(`${this.environment.apiUrl}/Travel/TIall`,buBrandModel);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Travel/TIby-id/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Travel/TIupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Travel/TIdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}


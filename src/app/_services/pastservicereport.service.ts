import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class PastservicereportService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }


  save(model) {
    return this.http.post(`${this.environment.apiUrl}/ServiceReports/PSRadd`, model);
  }

  getAll = ()=> {
    return this.http.get(`${this.environment.apiUrl}/ServiceReports/PSRall`);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/ServiceReports/PSRby-id/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/ServiceReports/PSRupdate/${id}`, params)
      .pipe(map(x => x));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/ServiceReports/PSRdelete/${id}`)
    .pipe(map(x => x));

  }
}


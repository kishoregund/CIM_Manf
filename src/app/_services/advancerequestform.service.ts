import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class AdvancerequestformService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }


  save(model) {
    return this.http.post(`${this.environment.apiUrl}/Travel/ADVadd`, model);
  }

  getAll(buBrandModel) {
    return this.http.post(`${this.environment.apiUrl}/Travel/ADVall`,buBrandModel);
  }

  getById(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Travel/ADVby-id/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Travel/ADVupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Travel/ADVdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}

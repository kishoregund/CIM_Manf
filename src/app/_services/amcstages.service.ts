import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class AmcstagesService {

  constructor(private http: HttpClient, private environment: EnvService,) { }

  save(AMCStages) {
    return this.http.post(`${this.environment.apiUrl}/AMC/ASadd`, AMCStages);
  }

  //by AMC Id
  getAll(id) {
    return this.http.get(`${this.environment.apiUrl}/AMC/ASall/${id}`);
  }

  getById(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/AMC/ASby-id/${id}`
      // `${this.environment.apiUrl}/AMCStages/getprocess/${id}`
    );
  }

  update(params) {
    return this.http
      .put(`${this.environment.apiUrl}/AMC/ASupdate`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/AMC/ASdelete/${id}`)
    .pipe(
      map((x) => {
        return x;
      })
    );
  }

}

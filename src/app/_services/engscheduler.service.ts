import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class EngSchedulerService {

  constructor(private router: Router, private http: HttpClient, private environment: EnvService,) {
  }

  save(EngSchedulers: any) {
    return this.http.post(`${this.environment.apiUrl}/ServiceRequests/ESadd`, EngSchedulers);
  }

  getAll(sreqId:String) {
    return this.http.get(`${this.environment.apiUrl}/ServiceRequests/ESall/${sreqId}`);
  }

  getById(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/ServiceRequests/ESby-id/${id}`
    );
  }

  getByEngId(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/ServiceRequests/ESbyengid/${id}`
    );
  }


  update(id, params) {
    return this.http
      .put(`${this.environment.apiUrl}/ServiceRequests/ESupdate`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/ServiceRequests/ESdelete/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}

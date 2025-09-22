import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sparePartsConsumed } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class SRConsumedService {
  private engcommentSubject: BehaviorSubject<sparePartsConsumed>;
  public engcomment: Observable<sparePartsConsumed>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
  }



  save(sprecon: sparePartsConsumed) {
    return this.http.post(`${this.environment.apiUrl}/ServiceReports/SPCadd`, sprecon);
  }

  getAll(SRPId:string) {
    return this.http.get<sparePartsConsumed[]>(`${this.environment.apiUrl}/ServiceReports/SPCall/${SRPId}`);
  }

  getById(id: string) {
    return this.http.get<sparePartsConsumed>(`${this.environment.apiUrl}/ServiceReports/SPCby-id/${id}`);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/ServiceReports/SPCupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/ServiceReports/SPCdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}

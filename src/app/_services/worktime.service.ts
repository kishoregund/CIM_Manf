import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { workTime } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class WorkTimeService {
  private engcommentSubject: BehaviorSubject<workTime>;
  public engcomment: Observable<workTime>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }



  save(worktime: workTime) {
    return this.http.post(`${this.environment.apiUrl}/ServiceReports/WTadd`, worktime);
  }

  getAll(SRPId:string) {
    return this.http.get<workTime[]>(`${this.environment.apiUrl}/ServiceReports/WTall/${SRPId}`);
  }

  getById(id: string) {
    return this.http.get<workTime>(`${this.environment.apiUrl}/ServiceReports/WTby-id/${id}`);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/ServiceReports/WTupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/ServiceReports/WTdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { workDone } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })

export class WorkDoneService {
  private engcommentSubject: BehaviorSubject<workDone>;
  public engcomment: Observable<workDone>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }



  save(workdone: workDone) {
    return this.http.post(`${this.environment.apiUrl}/ServiceReports/WDadd`, workdone);
  }

  getAll(SRPId:string) {
    return this.http.get<workDone[]>(`${this.environment.apiUrl}/ServiceReports/WDall/${SRPId}`);
  }

  getById(id: string) {
    return this.http.get<workDone>(`${this.environment.apiUrl}/ServiceReports/WDby-id/${id}`);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/ServiceReports/WDupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/ServiceReports/WDdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}

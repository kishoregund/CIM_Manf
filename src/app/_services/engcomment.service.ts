import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EngineerCommentList } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class EngCommentService {
  private engcommentSubject: BehaviorSubject<EngineerCommentList>;
  public engcomment: Observable<EngineerCommentList>;

    constructor(
        private router: Router,
        private http: HttpClient,
        private environment: EnvService,
    ) {
    }

  

  save(engcomment: EngineerCommentList) {
    return this.http.post(`${this.environment.apiUrl}/ServiceRequests/ECadd`, engcomment);
    }

  getAll() {
    return this.http.get<EngineerCommentList[]>(`${this.environment.apiUrl}/ServiceRequests/ECall`);
    }

  getById(id: string) {
    return this.http.get<EngineerCommentList>(`${this.environment.apiUrl}/ServiceRequests/ECby-id/${id}`);
    }

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<EngineerCommentList[]>(`${this.environment.apiUrl}/SREngComments/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

    update(id, params) {
      return this.http.put(`${this.environment.apiUrl}/ServiceRequests/ECupdate`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${this.environment.apiUrl}/ServiceRequests/ECdelete/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }

}

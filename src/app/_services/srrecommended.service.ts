import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sparePartRecommended } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class SRRecommendedService {
  private engcommentSubject: BehaviorSubject<sparePartRecommended>;
  public engcomment: Observable<sparePartRecommended>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
  }



  save(sprecon: sparePartRecommended) {
    return this.http.post(`${this.environment.apiUrl}/ServiceReports/SPRadd`, sprecon);
  }

  getAll(SRPId:string) {
    return this.http.get<sparePartRecommended[]>(`${this.environment.apiUrl}/ServiceReports/SPRall/${SRPId}`);
  }

  getById(id: string) {
    return this.http.get<sparePartRecommended>(`${this.environment.apiUrl}/ServiceReports/SPRby-id/${id}`);
  }

  getByGrid(buBrandModel) {
    return this.http.post(`${this.environment.apiUrl}/ServiceReports/SPRgrid`,buBrandModel);
  }


  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/ServiceReports/SPRupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/ServiceReports/SPRdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}

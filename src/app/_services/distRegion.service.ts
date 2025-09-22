import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DistributorRegion } from '../_models';
import { EnvService } from './env/env.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class DistributorRegionService {
  private distrubutorSubject: BehaviorSubject<DistributorRegion>;
  public distributor: Observable<DistributorRegion>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
    private notificationService: NotificationService
  ) { }

  SaveRegion() {
    var formData = JSON.parse(sessionStorage.getItem('distributorRegion'))
    this.save(formData).subscribe((data: any) => {
      if (data.isSuccessful) this.notificationService.showSuccess(data.messages[0], "Success")
      else this.notificationService.showInfo(data.messages[0], "Info")
    })
  }

  save(distributor: DistributorRegion) {
    return this.http.post(`${this.environment.apiUrl}/Distributors/Radd`, distributor);
  }

  CheckIsExisting(distributor: DistributorRegion) {
    return this.http.post(`${this.environment.apiUrl}/DistRegions/exists`, distributor);
  }

  getAll() {
    return this.http.get<DistributorRegion[]>(`${this.environment.apiUrl}/Distributors/Rall`);
  }
  
  getAllAssigned() {
    return this.http.get<DistributorRegion[]>(`${this.environment.apiUrl}/Distributors/Rallassigned`);
  }  

  getById(id: string) {
    return this.http.get<DistributorRegion>(`${this.environment.apiUrl}/Distributors/Rby-id/${id}`);
  }

  getDistByCustomerId(id: string) {
    return this.http.get<DistributorRegion[]>(`${this.environment.apiUrl}/Site/GetDistRegionsByCustomer/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Distributors/Rupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/DistRegions/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}

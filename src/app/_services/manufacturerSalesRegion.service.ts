import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvService } from './env/env.service';
import { NotificationService } from './notification.service';
import { ManufacturerSalesRegion } from '../_models/manufacturerSalesRegion';

@Injectable({ providedIn: 'root' })
export class ManufacturerSalesRegionService {
  private ManfSalesRegionSubject: BehaviorSubject<ManufacturerSalesRegion>;
  public ManfSalesRegion: Observable<ManufacturerSalesRegion>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
    private notificationService: NotificationService
  ) { }

  SaveRegion() {
    var formData = JSON.parse(sessionStorage.getItem('ManfSalesRegionRegion'))
    this.save(formData).subscribe((data: any) => {
      if (data.isSuccessful) this.notificationService.showSuccess(data.messages[0], "Success")
      else this.notificationService.showInfo(data.messages[0], "Info")
    })
  }

  save(ManfSalesRegion: ManufacturerSalesRegion) {
    return this.http.post(`${this.environment.apiUrl}/Manufacturers/SRadd`, ManfSalesRegion);
  }

  CheckIsExisting(ManfSalesRegion: ManufacturerSalesRegion) {
    return this.http.post(`${this.environment.apiUrl}/DistRegions/exists`, ManfSalesRegion);
  }

  getAll() {
    return this.http.get<ManufacturerSalesRegion[]>(`${this.environment.apiUrl}/Manufacturers/SRall`);
  }

  getById(id: string) {
    return this.http.get<ManufacturerSalesRegion>(`${this.environment.apiUrl}/Manufacturers/SRby-id/${id}`);
  }

  getDistByCustomerId(id: string) {
    return this.http.get<ManufacturerSalesRegion[]>(`${this.environment.apiUrl}/Site/GetDistRegionsByCustomer/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Manufacturers/SRupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Manufacturers/SRdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}

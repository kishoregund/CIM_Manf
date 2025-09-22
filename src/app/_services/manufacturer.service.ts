import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvService } from './env/env.service';
import { NotificationService } from './notification.service';
import { Manufacturer } from '../_models/manufacturer';
import { ManfSalesRegionContacts } from '../_models/manfSalesRegionContact';

@Injectable({ providedIn: 'root' })
export class ManufacturerService {
  private manufacturerSubject: BehaviorSubject<Manufacturer>;
  public manufacturer: Observable<Manufacturer>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private notificationService: NotificationService,
    private http: HttpClient
  ) {
    //this.manufacturerSubject = new BehaviorSubject<Manufacturer>();
    //this.user = this.manufacturerSubject.asObservable();
  }

  //public get userValue(): User {
  //    return this.userSubject.value;
  //}


  SaveManufacturer() {
    var value = JSON.parse(sessionStorage.getItem('manufacturer'));
    this.save(value).subscribe((data: any) => {
      if (data.result) {
        this.notificationService.showSuccess(data.resultMessage, "Success");
      }
      else {
        this.notificationService.showInfo(data.resultMessage, "Info");
      }
    });
  }

  save(manufacturer: Manufacturer) {
    return this.http.post(`${this.environment.apiUrl}/Manufacturers/add`, manufacturer);
  }

  getengineername(id: string) {
    return this.http.get<ManfSalesRegionContacts>(
      ` ${this.environment.apiUrl}/manufacturers/GetManufacturerRegionContacts/${id}`
    );
  }

  getAll() {
    return this.http.get<Manufacturer[]>(`${this.environment.apiUrl}/Manufacturers/all`);
  }

  getById(id: string) {
    return this.http.get<Manufacturer>(`${this.environment.apiUrl}/Manufacturers/by-id/${id}`);
  }

  getByConId(id: string) {
    return this.http.get<Manufacturer>(`${this.environment.apiUrl}/Manufacturers/getbyconid/${id}`);
  }

  //GetManufacturerRegionContacts
  getManufacturerRegionContacts(id: string) {
    return this.http.get<Manufacturer>(`${this.environment.apiUrl}/Manufacturers/GetManufacturerRegionContacts/${id}`);
  }
  
  getManufacturerRegionEngineers(id: string) {
    return this.http.get<Manufacturer>(`${this.environment.apiUrl}/Manufacturers/GetManufacturerRegionEngineers/${id}`);
  }

  GetManufacturerRegionContactsByContactId(id: string) {
    return this.http.get<Manufacturer>(`${this.environment.apiUrl}/Manufacturers/GetManufacturerRegionContactsByContactId/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Manufacturers/update`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  ImportData(data: any) {
    return this.http.post(`${this.environment.apiUrl}/Manufacturers/importdata`, data)
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Manufacturers/delete/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomerSite } from '../_models';
import { EnvService } from './env/env.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class CustomerSiteService {
  private distrubutorSubject: BehaviorSubject<CustomerSite>;
  public distributor: Observable<CustomerSite>;

  constructor(
    private notificationService: NotificationService,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  SaveSite() {
    var formData = JSON.parse(sessionStorage.getItem('site'));
    this.save(formData).subscribe((data: any) => {
      if (data.result) this.notificationService.showSuccess(data.resultMessage, "Success")
      else this.notificationService.showInfo(data.resultMessage, "Info")
    })
  }

  save(customerSite: CustomerSite) {
    return this.http.post(`${this.environment.apiUrl}/Customers/Sadd`, customerSite);
  }


  CheckSite(site: any) {
    return this.http.post(`${this.environment.apiUrl}/Site/CheckSite`, site);
  }

  getAll(custId:string) {
    return this.http.get<CustomerSite[]>(`${this.environment.apiUrl}/Customers/Sall/${custId}`);
  }

  getAllCustomerSites() {
    return this.http.get<CustomerSite[]>(`${this.environment.apiUrl}/Site/GetAllCustomerSites`);
  }

   getCustomerSiteByContact(id: string) {
      return this.http.get(`${this.environment.apiUrl}/Customers/Sallbycontact/${id}`);
    }

  GetCustomerSiteContacts(siteId:string) {
    return this.http.get(`${this.environment.apiUrl}/Customers/SCall/${siteId}`);
  }
  getById(id: string) {
    return this.http.get<CustomerSite>(`${this.environment.apiUrl}/Customers/Sby-id/${id}`);
  }

  getDistRegionsByCustId(customerId: string) {
    return this.http.get<any>(`${this.environment.apiUrl}/Customers/distregionbycustid/${customerId}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Customers/Supdate`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        //if (id == this.distributor.id) {
        //      // update local storage
        //      const user = { ...this.userValue, ...params };
        //      sessionStorage.setItem('user', JSON.stringify(user));

        //      // publish updated user to subscribers
        //      this.userSubject.next(user);
        //  }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Customers/Sdelete/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}

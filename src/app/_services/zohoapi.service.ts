import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { Amc } from '../_models';
import { AccountService } from '../_services';
import { EnvService } from './env/env.service';


@Injectable({ providedIn: 'root' })
export class zohoapiService {
  private AmcSubject: BehaviorSubject<Amc>;
  public Amc: Observable<Amc>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
    private accountService: AccountService
  ) {
    //this.distrubutorSubject = new BehaviorSubject<Distributor>();
    //this.user = this.distrubutorSubject.asObservable();
  }

  //public get userValue(): User {
  //    return this.userSubject.value;
  //}

  authservice() {
    window.location.href = this.environment.zohocodeapi;
  }


  GetSalesOrder(code, page, orderNumber, id?) {
    return this.http.get(`${this.environment.apiUrl}/Zoho/salesorders/${this.accountService.zohoauthValue}/${page}?salesorder_number_startswith=${orderNumber}&offerrequestid=${id}`);
  }

  authwithcode(code: string, endPoint?: string) {
    //const formData: FormData = new FormData();
    //formData.append('code', code);
    //formData.append('client_id', this.environment.client);
    //formData.append('client_secret', this.environment.secret);
    //formData.append('redirect_uri', this.environment.redirecturl);
    //formData.append('grant_type', "authorization_code");
    // let url = "${ this.environment.apiUrl }/Amc/${id}"
    return this.http.get(`${this.environment.apiUrl}/Zoho/GetZToken/${code}/${endPoint}`);
    // debugger;
    // var Zdata = this.http.post(`https://accounts.zoho.com/oauth/v2/token?code=${code}&client_id=1000.5H07NQJOLXW69IEHWG3GICTVU8L51W&client_secret=2f54ec5f719c6ee911a367c16211f8d3576378d013&redirect_uri=http://localhost:4200/custpayrpt&grant_type=authorization_code`, null);
    // return Zdata
  }

  getAllinvoice() {
    return this.http.get(`${this.environment.apiUrl}/zoho/invoices/1`);
  }

  getAllCustomerPayments(custname: string, page: number) {
    if (page == 0 || page == undefined) {
      page = 1;
    }
    return this.http.get(`${this.environment.apiUrl}/zoho/customerpament/` + this.accountService.zohoauthValue + `/` + page + "?customer_name_contains=" + custname);
  }

  getSrConrtactRevenue(custname: string, page: number) {
    if (page == 0 || page == undefined) {
      page = 1;
    }
    return this.http.get(`${this.environment.apiUrl}/zoho/salesorders/` + this.accountService.zohoauthValue + `/` + page + `?customer_name_contains=` + custname);
  }

  getquotation(custname: string, page: number) {
    if (page == 0 || page == undefined) {
      page = 1;
    }
    return this.http.get(`${this.environment.apiUrl}/zoho/salesorders/` + this.accountService.zohoauthValue + `/` + page + `?salesorder_number_startswith=SQT&customer_name_contains=` + custname);
  }
  getsostatus(custname: string, page: number) {
    if (page == 0 || page == undefined) {
      page = 1;
    }
    return this.http.get(`${this.environment.apiUrl}/zoho/purchaseorders/` + this.accountService.zohoauthValue + `/` + page + `?cf_intended_customer=` + custname);
  }

  getAll() {
    return this.http.get<Amc[]>(`${this.environment.apiUrl}/Amc`);
  }

  getById(id: string) {
    return this.http.get<Amc>(`${this.environment.apiUrl}/Amc/${id}`);
  }

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<Amc[]>(`${this.environment.apiUrl}/Amc/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Amc`, params)
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
    return this.http.delete(`${this.environment.apiUrl}/Amc/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }

  deleteConfig(deleteConfig: Amc) {
    return this.http.post(`${this.environment.apiUrl}/Instrumentconfig/RemoveInsConfigType`, deleteConfig)
    //.pipe(map(x => {
    //  //// auto logout if the logged in user deleted their own record
    //  //if (id == this.userValue.id) {
    //  //    this.logout();
    //  //}
    //  return x;
    //}));
  }

}

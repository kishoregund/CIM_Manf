import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Amc } from '../_models';
import { VW_Contacts } from '../_models/customerdashboard';
import { EnvService } from './env/env.service';
import { Offerrequest } from '../_models/Offerrequest.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerdashboardService {

  private vW_ContactsSubject: BehaviorSubject<Amc>;
  public vW_Contacts: Observable<Amc>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,

  ) { }

  AllOfferRequest() {
    return this.http.get<Offerrequest[]>(`${this.environment.apiUrl}/Dashboard/alloffreq`);
  }


  GetCostData({ sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/Dashboard/costdata`, { sdate, edate });
  }

  GetCostOfOwnerShip(insId: string) {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/ownershipcost/${insId}`);
  }

  GetAllServiceRequest() {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/allserreq`)
  }

  GetAllAmc() {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/allamc`)
  }

  GetSparePartsRecommended() {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/sparerecommended`)
  }

  GetCustomerDetails() {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/customerdetails`)
  }
  GetSiteInstrument(siteId) {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/siteinstr/${siteId}`)
  }

  GetSerReqInstrument(insId) {
    return this.http.get(`${this.environment.apiUrl}/Dashboard/serreqinstr/${insId}`)
  }

}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceRequest } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class ServiceRequestService {
  private serviceRequestSubject: BehaviorSubject<ServiceRequest>;
  public serviceRequest: Observable<ServiceRequest>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
    //this.distrubutorSubject = new BehaviorSubject<Distributor>();
    //this.user = this.distrubutorSubject.asObservable();
  }

  //public get userValue(): User {
  //    return this.userSubject.value;
  //}


  save(serviceRequest: ServiceRequest) {
    return this.http.post(`${this.environment.apiUrl}/ServiceRequests/add`, serviceRequest);
  }

  getAll(buBrandModel) {
    return this.http.post(`${this.environment.apiUrl}/ServiceRequests/allbybubrand`,buBrandModel);
    //return this.http.get<ServiceRequest[]>(`${this.environment.apiUrl}/serviceRequest/GetByAssignedRegions/${userId}`);
  }

  getDistDashboardData({ distId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/serviceRequest/distdashboard`, { sdate, edate, distId });
  }

  getById(id: string) {
    return this.http.get<ServiceRequest>(`${this.environment.apiUrl}/ServiceRequests/by-id/${id}`);
  }
  
 GetSiteUsers(id: string) {
    return this.http.get<ServiceRequest>(`${this.environment.apiUrl}/ServiceRequests/siteusers/${id}`);
  }

  //GetSerReqNo
  getSerReqNo() {
    return this.http.get<ServiceRequest>(`${this.environment.apiUrl}/ServiceRequests/SRno`);
  }

  GetInstrument(insId: string, siteId:string) {
    return this.http.get(`${this.environment.apiUrl}/ServiceRequests/SRInsbyinstr/${insId}/${siteId}`);
  }

  GetServiceRequestByConId(id: string) {
    return this.http.get<ServiceRequest>(`${this.environment.apiUrl}/serviceRequest/GetServiceRequestByConId/${id}`);
  }

  GetServiceRequestByDist(id: string) {
    return this.http.get<ServiceRequest>(`${this.environment.apiUrl}/Customers/CSSsrbydist/${id}`);
  }

  
  GetServiceRequestBySRPId(id: string) {
    return this.http.get<ServiceRequest>(`${this.environment.apiUrl}/Customers/CSSsrbysrp/${id}`);
  }
  

  searchByKeyword(param: string, custSiteId: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<ServiceRequest[]>(`${this.environment.apiUrl}/serviceRequest/GetInstrumentBySerialNo/${param}/${custSiteId}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/ServiceRequests/update`, params)
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
  updateIsAccepted(id, params) {
    return this.http.put(`${this.environment.apiUrl}/serviceRequest/accepted`, params)
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
    return this.http.delete(`${this.environment.apiUrl}/ServiceRequests/delete/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }

  deleteConfig(deleteConfig: ServiceRequest) {
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

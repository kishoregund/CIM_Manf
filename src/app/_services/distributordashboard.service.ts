import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class DistributordashboardService {

  constructor(private http: HttpClient, private environment: EnvService,) { }


  GetInstrumentInstalled({ distId,businessUnitId, brandId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/Dashboard/DistInsInstall`, { distId, businessUnitId, brandId, sdate, edate })
  }

  RevenueFromCustomer({ distId,businessUnitId, brandId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/Dashboard/DistCustRev`, { distId,businessUnitId, brandId, sdate, edate })
  }

  ServiceContractRevenue({ distId,businessUnitId, brandId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/Dashboard/DistSerConRev`, { distId,businessUnitId, brandId, sdate, edate })
  }

  GetDistDashboardData({ distId,businessUnitId, brandId, sdate, edate }) {
    return this.http.post(`${this.environment.apiUrl}/Dashboard/DistDashData`, { sdate, edate,businessUnitId, brandId, distId })
  }


}

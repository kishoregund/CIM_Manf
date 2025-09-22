import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Instrument, InstrumentConfig } from '../_models';
import { EnvService } from './env/env.service';
import { CustomerInstrument } from '../_models/customerinstrument';

@Injectable({ providedIn: 'root' })
export class CustomerInstrumentService {
  public distributor: Observable<Instrument>;

  constructor(
    private environment: EnvService,
    private http: HttpClient
  ) {
  }


  save(instrument: CustomerInstrument) {
    return this.http.post(`${this.environment.apiUrl}/Customers/CInsadd`, instrument);
  }

  getAll(buBrandModel) {        
    return this.http.post(`${this.environment.apiUrl}/Customers/CInsall`,buBrandModel);
    //return this.http.get<Instrument[]>(`${this.environment.apiUrl}/Customers/GetByAssignedRegions/${buId}/${brandId}`);
  }

  getFilteredAll(dataModel, controller) {
    return this.http.post(`${this.environment.apiUrl}/${controller}/FilterData`, dataModel);
  }


  getInstrumentConfif(insId: string) {
    return this.http.get(`${this.environment.apiUrl}/Instrumentconfig/GetByInstrument/${insId}`);
  }

  getById(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Customers/CInsby-id/${id}`);
  }

  getByInstrument(insId: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Customers/CIinsbyins/${insId}`);
  }

  getInstrumentSpares(insId: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Customers/CInsspares/${insId}`);
  }
  
  getSerReqInstrument(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instrument/GetSerReqInstrument/${id}`);
  }

  getinstubysiteIds(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instrument/GetSiteInstruments/${id}`);
  }

  GetInstrumentBySite(custSiteId: string) {
    return this.http.get<Instrument[]>(`${this.environment.apiUrl}/Customers/insbysite/${custSiteId}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Customers/CInsupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Customers/CInsdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

  deleteConfig(deleteConfig: InstrumentConfig) {
    return this.http.post(`${this.environment.apiUrl}/Instrumentconfig/RemoveInsConfigType`, deleteConfig)
  }

}

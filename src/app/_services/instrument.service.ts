import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Instrument, InstrumentConfig } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class InstrumentService {
  public distributor: Observable<Instrument>;

  constructor(
    private environment: EnvService,
    private http: HttpClient
  ) {
  }


  save(instrument: Instrument) {
    return this.http.post(`${this.environment.apiUrl}/Instruments/add`, instrument);
  }

  
  getAll(buBrandModel,) {
    return this.http.post(`${this.environment.apiUrl}/Instruments/all`,buBrandModel);
  }

  // getAll(userId: string,) {
  //   return this.http.get<Instrument[]>(`${this.environment.apiUrl}/Instrument/GetByAssignedRegions/${userId}`);
  // }

  getFilteredAll(dataModel, controller) {
    return this.http.post(`${this.environment.apiUrl}/${controller}/FilterData`, dataModel);
  }


  // getInstrumentConfif(insId: string) {
  //   return this.http.get(`${this.environment.apiUrl}/Instrumentconfig/GetByInstrument/${insId}`);
  // }

  getById(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instruments/by-id/${id}`);
  }

  getSerReqInstrument(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instrument/GetSerReqInstrument/${id}`);
  }

  getinstubysiteIds(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instrument/GetSiteInstruments/${id}`);
  }

  searchByKeyword(param: string) {
    param = param == "" ? "undefined" : param;
    return this.http.get<Instrument[]>(`${this.environment.apiUrl}/Instruments/byserno/${param}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Instruments/update`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Instruments/delete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

  deleteConfig(deleteConfig: InstrumentConfig) {
    return this.http.post(`${this.environment.apiUrl}/Instrumentconfig/RemoveInsConfigType`, deleteConfig)
  }

}

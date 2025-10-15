import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Instrument, InstrumentConfig } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class InstrumentAllocationService {

  constructor(
    private environment: EnvService,
    private http: HttpClient
  ) {
  }


  save(instrument:any) {
    return this.http.post(`${this.environment.apiUrl}/Instruments/InAlladd`, instrument);
  }

  
  getAll() {
    return this.http.get(`${this.environment.apiUrl}/Instruments/InAllall`);
  }

  getById(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instruments/InAllby-id/${id}`);
  }

  getByInsId(id: string) {
    return this.http.get<Instrument>(`${this.environment.apiUrl}/Instruments/InAllby-insid/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Instruments/InAllupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Instruments/InAlldelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}

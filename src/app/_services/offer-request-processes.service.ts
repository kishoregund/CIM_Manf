import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Offerrequest } from '../_models/Offerrequest.model';
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class OfferRequestProcessesService {

  constructor(
    private http: HttpClient,
    private environment: EnvService,
  ) { }
  
  save(OfferRequestProcesses) {
    return this.http.post(`${this.environment.apiUrl}/SparepartQuotations/ORPadd`, OfferRequestProcesses);
  }

  getAll(id) {
    return this.http.get(`${this.environment.apiUrl}/SparepartQuotations/ORPall/${id}`);
  }

  getById(id: string) {
    return this.http.get(
      `${this.environment.apiUrl}/SparepartQuotations/ORPby-id/${id}`
      //`${this.environment.apiUrl}/OfferRequestProcesses/getprocess/${id}`
    );
  }

  update(params) {
    return this.http
      .put(`${this.environment.apiUrl}/SparepartQuotations/ORPupdate`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/SparepartQuotations/ORPdelete/${id}`).pipe(
      map((x) => {
        return x;
      })
    );
  }

}

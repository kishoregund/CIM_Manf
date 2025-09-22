import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Country } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private ContactSubject: BehaviorSubject<Country>;
  public contact: Observable<Country>;

    constructor(
        private router: Router,
        private http: HttpClient,
        private environment: EnvService,

    ) {
    }

  save(country: Country) {
    return this.http.post(`${this.environment.apiUrl}/Masters/COadd`, country);
    }

    getAll() {
      return this.http.get<Country[]>(`${this.environment.apiUrl}/Masters/COall`);
    }

    getById(id: string) {
      return this.http.get<Country>(`${this.environment.apiUrl}/Masters/COby-id/${id}`);
    }

    update(id, params) {
      return this.http.put(`${this.environment.apiUrl}/Masters/COupdate`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    delete(id: string) {
      return this.http.delete(`${this.environment.apiUrl}/Masters/COdelete/${id}`)
            .pipe(map(x => {
                return x;
            }));
    }
}

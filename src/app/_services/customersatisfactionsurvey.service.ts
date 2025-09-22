import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Customersatisfactionsurvey } from "../_models/customersatisfactionsurvey";
import { EnvService } from "./env/env.service";

@Injectable({
  providedIn: "root",
})
export class CustomersatisfactionsurveyService {
  public CustomerSatisfactionSurvey: Observable<CustomersatisfactionsurveyService>;

  constructor(private http: HttpClient, private environment: EnvService) { }

  save(CustomerSatisfactionSurvey: CustomersatisfactionsurveyService) {
    return this.http.post(
      `${this.environment.apiUrl}/Customers/CSSadd`,
      CustomerSatisfactionSurvey
    );
  }

  getAll() {
    return this.http.get<Customersatisfactionsurvey[]>(
      `${this.environment.apiUrl}/Customers/CSSall`
    );
  }

  getById(id: string) {
    return this.http.get<CustomersatisfactionsurveyService>(
      `${this.environment.apiUrl}/Customers/CSSby-id/${id}`
    );
  }

  update(id, params) {
    return this.http
      .put(`${this.environment.apiUrl}/Customers/CSSupdate`, params)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }

  delete(id: string) {
    return this.http
      .delete(`${this.environment.apiUrl}/Customers/CSSdelete/${id}`)
      .pipe(
        map((x) => {
          return x;
        })
      );
  }
}

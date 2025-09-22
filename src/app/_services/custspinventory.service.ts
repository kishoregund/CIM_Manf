import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Custspinventory } from "../_models/custspinventory";
import { EnvService } from './env/env.service';

@Injectable({
  providedIn: 'root'
})
export class CustspinventoryService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  save(action: Custspinventory) {
    return this.http.post(`${this.environment.apiUrl}/Customers/SPIadd`, action);
  }

  getAll(contactId, custid?) {
    return this.http.get<Custspinventory[]>(`${this.environment.apiUrl}/Customers/SPIall/${contactId}/${custid}`);
  }

  GetSPInvenrotyForServiceReport(id: string) {
    return this.http.get(`${this.environment.apiUrl}/CustSPInventory/GetSPInvenrotyForServiceReport/${id}`);
  }

  getHistory(custSPInventoryId) {
    return this.http.get<Custspinventory[]>(`${this.environment.apiUrl}/Customers/SPIconsumedhistory/${custSPInventoryId}`);
  }

  getById(id: string) {
    return this.http.get<Custspinventory>(`${this.environment.apiUrl}/Customers/SPIby-id/${id}`);
  }

  GetSparePartByNo(id: string) {
    return this.http.get(`${this.environment.apiUrl}/Customers/SPIbypartno/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Customers/SPIupdate`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  updateqty(id, qty) {
    return this.http.put(`${this.environment.apiUrl}/Customers/SPIqtyupdate/${id}/${qty}`, qty)
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/Customers/SPIdelete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }

}

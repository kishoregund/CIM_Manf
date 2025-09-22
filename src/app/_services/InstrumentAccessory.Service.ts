import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { EnvService } from "./env/env.service";

@Injectable({ providedIn: 'root' })
export class InstrumentAccessoryService {
    constructor(
        private http: HttpClient,
        private environment: EnvService
    ) { }

    save(obj) {
        return this.http.post(`${this.environment.apiUrl}/Instruments/IAadd`, obj);
    }

    // getAll() {
    //     return this.http.get(`${this.environment.apiUrl}/Instruments/IAall`);
    // }

    GetByInsId(instrumentId:string) {
        return this.http.get(`${this.environment.apiUrl}/Instruments/IAall/${instrumentId}`);
    }

    getById(id: string) {
        return this.http.get(`${this.environment.apiUrl}/Instruments/IAby-id/${id}`);
    }


    update(id, params) {
        return this.http.put(`${this.environment.apiUrl}/Instruments/IAupdate`, params)
    }

    delete(id: string) {
        return this.http.delete(`${this.environment.apiUrl}/Instruments/IAdelete/${id}`)
    }
}
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile, User } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private ContactSubject: BehaviorSubject<UserProfile>;
  public contact: Observable<UserProfile>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
  ) {
  }

  save(profile: UserProfile) {
    return this.http.post(`${this.environment.apiUrl}/UserProfiles/add`, profile);
  }

  getAll() {
    return this.http.get<UserProfile[]>(`${this.environment.apiUrl}/UserProfiles/all`);
  }

  getById(id: string) {
    return this.http.get<UserProfile>(`${this.environment.apiUrl}/UserProfiles/by-id/${id}`);
  }

  getByUserId(id: string, contactType:string) {
    if(contactType = "DR")    { 
    return this.http.get<User>(`${this.environment.apiUrl}/UserProfiles/UPdistuserbyconid/${id}`);
    }
    else if(contactType = "CS")    { 
      return this.http.get<User>(`${this.environment.apiUrl}/UserProfiles/UPcustuserbyconid/${id}`);
    }
    else if(contactType = "MSR")    { 
        return this.http.get<User>(`${this.environment.apiUrl}/UserProfiles/UPmanfuserbyconid/${id}`);
    }
  }

  getUserAll() {
    return this.http.get<User[]>(`${this.environment.apiUrl}/UserProfiles/GetAllUser`);
  }

  getRegionsByConId(contactId : string)
  {
    return this.http.get(`${this.environment.apiUrl}/UserProfiles/UPregionsbyconid/${contactId}`);
  }

  getSitesByConId(contactId : string)
  {
    return this.http.get(`${this.environment.apiUrl}/UserProfiles/UPsitesbyconid/${contactId}`);
  }

  getByProfileRegion(profilefor: string, id: string) {
    return this.http.get<UserProfile>(`${this.environment.apiUrl}/UserProfiles/GetProfileRegions/${profilefor}/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/UserProfiles/update`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/UserProfiles/delete/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}

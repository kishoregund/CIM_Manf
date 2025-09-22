import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { EnvService } from './env/env.service';
import { Role, RoleReadOnly } from '../_models/role';

@Injectable({ providedIn: 'root' })

export class RoleService {
  public roleSubject: BehaviorSubject<RoleReadOnly>;
  public userRole: Observable<RoleReadOnly>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
    this.roleSubject = new BehaviorSubject<RoleReadOnly>(JSON.parse(sessionStorage.getItem('userprofile')));
    //this.user = this.distrubutorSubject.asObservable();
    this.userRole = this.roleSubject.asObservable();
  }

  public get userRoleValue(): RoleReadOnly {
    return this.roleSubject.value;
  }

  //isAllowedRoles(profilePermission: any) {
  //  let permission: any = [];
  //  var isSearch = profilePermission
  //}


  save(profile: Role) {
    return this.http.post(`${this.environment.apiUrl}/Roles/add`, profile);
  }

  getAll() {
    return this.http.get<Role[]>(`${this.environment.apiUrl}/Roles/all`);
  }

  getById(id: string) {
    return this.http.get<Role>(`${this.environment.apiUrl}/roles/role/${id}`);
  }
  
  GetAllScreens() {
    return this.http.get(`${this.environment.apiUrl}/roles/allscreens`);
  }

  getUserRole(roleId: string) {
    //debugger;
    // this.http.get<Role>(`${this.environment.apiUrl}/UserProfiles/${value}`).
    //   pipe(first()).subscribe((data: any) => {
    //     if(data.object != null)
    //     {
          this.getById(roleId)
            .pipe(first()).subscribe((pdata: any) => {
              sessionStorage.setItem('userprofile', JSON.stringify(pdata.data));
              this.roleSubject.next(pdata.data);
          });
      //   }
      // });
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Roles/update`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        //if (id == this.distributor.id) {
        //      // update local storage
        //      const user = { ...this.userValue, ...params };
        //      sessionStorage.setItem('user', JSON.stringify(user));

        //      // publish updated user to subscribers
        //      this.userSubject.next(user);
        //  }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/roles/delete/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}

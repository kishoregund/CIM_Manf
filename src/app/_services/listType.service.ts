import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ListTypeItem } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class ListTypeService {
  private roleSubject: BehaviorSubject<ListTypeItem>;
  public role: Observable<ListTypeItem>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
    this.roleSubject = new BehaviorSubject<ListTypeItem>(JSON.parse(sessionStorage.getItem('segments')));
    this.role = this.roleSubject.asObservable();
  }

  save(listType: ListTypeItem) {
    return this.http.post(`${this.environment.apiUrl}/Masters/LTIadd`, listType);
  }

  getAll() {
    return this.http.get<ListTypeItem[]>(`${this.environment.apiUrl}/ListItems`);
  }

  getById(code: string) {
    return this.http.get<ListTypeItem[]>(`${this.environment.apiUrl}/Masters/LTIcode/${code}`);
  }

  public get roleValue(): ListTypeItem {
    return this.roleSubject.value;
  }

  getItemById(id: string) {
    return this.http.get<ListTypeItem[]>(`${this.environment.apiUrl}/Masters/LTIby-id/${id}`)
      .pipe(map(x => {
        if (x != null) {
          this.roleSubject.next(x[0]);
        }
        return x;
      }));
  }

  GetListById(listid: string) {
    return this.http.get(`${this.environment.apiUrl}/Masters/LTYby-id/${listid}`)
  }

  getByListId(listid: string) {
    return this.http.get<ListTypeItem[]>(`${this.environment.apiUrl}/Masters/LTIlistid/${listid}`);
    //return this.http.get<ListTypeItem[]>(`${this.environment.apiUrl}/Masters/GetItemsByListId/${listid}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/Masters/LTIupdate`, params)
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
    return this.http.delete(`${this.environment.apiUrl}/Masters/LTIdelete/${id}`)
      .pipe(map(x => {
        //// auto logout if the logged in user deleted their own record
        //if (id == this.userValue.id) {
        //    this.logout();
        //}
        return x;
      }));
  }
}

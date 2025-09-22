import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contact } from '../_models';
import { EnvService } from './env/env.service';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private ContactSubject: BehaviorSubject<Contact>;
  public contact: Observable<Contact>;

  constructor(
    private router: Router,
    private environment: EnvService,
    private http: HttpClient
  ) {
    //this.distrubutorSubject = new BehaviorSubject<Distributor>();
    //this.user = this.distrubutorSubject.asObservable();
  }

  //public get userValue(): User {
  //    return this.userSubject.value;
  //}



  save(contact: Contact, type:string) {
    if(type == "DR")
    {return this.http.post(`${this.environment.apiUrl}/Distributors/RCadd`, contact);}
    else if(type == "CS")
      {return this.http.post(`${this.environment.apiUrl}/Customers/SCadd`, contact);}
    else if(type == "MSR")
      {return this.http.post(`${this.environment.apiUrl}/Manufacturers/SRCadd`, contact);}    
  }

  SaveDistributorTree(treeObj: any) {
    return this.http.post(`${this.environment.apiUrl}/Distributors/SaveTree`, treeObj);
  }
  SaveCustomerTree(treeObj: any) {
    return this.http.post(`${this.environment.apiUrl}/Customer/SaveTree`, treeObj);
  }

  getAll(type:string) {
    if(type == "DR")
      {return this.http.get<Contact[]>(`${this.environment.apiUrl}/Distributors/RCall`);}
      else if(type == "CS")
        {return this.http.get<Contact[]>(`${this.environment.apiUrl}/Customers/SCall`);}
      else if(type == "MSR")
        {return this.http.get<Contact[]>(`${this.environment.apiUrl}/Manufacturers/SRCall`);} 
    
  }

/// this method is created in the customersite service as its pulling sites 
  getCustomerSiteByContact(id: string) {
    return this.http.get<Contact[]>(`${this.environment.apiUrl}/Contacts/GetCustomerSiteByContact/${id}`);
  }
  //use from distributor
  // getDistByContact(id: string) {
  //   return this.http.get<Contact[]>(`${this.environment.apiUrl}/Contacts/GetDistributorByContact/${id}`);
  // }

  getById(id: string, type:string) {
    if(type == "DR")
      {return this.http.get<Contact[]>(`${this.environment.apiUrl}/Distributors/RCby-id/${id}`);}
      else if(type == "CS")
        {return this.http.get<Contact[]>(`${this.environment.apiUrl}/Customers/SCby-id/${id}`);}
      else if(type == "MSR")
        {return this.http.get<Contact[]>(`${this.environment.apiUrl}/Manufacturers/SRCby-id/${id}`);} 
  }


  update(id:string, params:any, type:string) {
    if(type == "DR")
      {return this.http.put(`${this.environment.apiUrl}/Distributors/RCupdate`, params);}
      else if(type == "CS")
        {return this.http.put(`${this.environment.apiUrl}/Customers/SCupdate`, params);}
      else if(type == "MSR")
        {return this.http.put(`${this.environment.apiUrl}/Manufacturers/SRCupdate`, params);} 

    // return this.http.put(`${this.environment.apiUrl}/Contacts/`, params)
    //   .pipe(map(x => {
    //     // update stored user if the logged in user updated their own record
    //     //if (id == this.distributor.id) {
    //     //      // update local storage
    //     //      const user = { ...this.userValue, ...params };
    //     //      sessionStorage.setItem('user', JSON.stringify(user));

    //     //      // publish updated user to subscribers
    //     //      this.userSubject.next(user);
    //     //  }
    //     return x;
    //   }));
  }

  delete(id: string, type:string) {
    if(type == "DR")
      {return this.http.delete(`${this.environment.apiUrl}/Distributors/RCdelete/${id}`);}
      else if(type == "CS")
        {return this.http.delete(`${this.environment.apiUrl}/Customers/SCdelete/${id}`);}
      else if(type == "MSR")
        {return this.http.delete(`${this.environment.apiUrl}/Manufacturers/SRCdelete/${id}`);} 

      
    // return this.http.delete(`${this.environment.apiUrl}/Contacts/${id}`)
    //   .pipe(map(x => {
    //     //// auto logout if the logged in user deleted their own record
    //     //if (id == this.userValue.id) {
    //     //    this.logout();
    //     //}
    //     return x;
    //   }));
  }
}

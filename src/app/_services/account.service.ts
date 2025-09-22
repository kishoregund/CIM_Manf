import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { first } from 'rxjs/operators';

import { ChangePasswordModel, ListTypeItem, Profile, User } from '../_models';
import { EnvService } from './env/env.service';
import { ListTypeService } from './listType.service';
import { ProfileService } from './profile.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CIMComponent } from '../account/cim.component';
import { NotificationService } from './notification.service';
//import { CreateCompanyComponent } from '../account/company.component';
import { CreateBusinessUnitComponent } from '../account/businessunit.component';
import { CreateBrandComponent } from '../account/brand.component';
import SetUp from '../account/setup.component';
import ExistingCIM from '../account/Existing.component';
import { UserDetails, UserLoginResponse } from '../_newmodels/UserDetails';
import { AppBasicService } from './AppBasic.service';
import { GenericResponse } from '../_newmodels/GenericResponse';
import { LoginToken } from '../_newmodels/LoginToken';
import { RoleService } from './role.service';
import { LoginModel } from '../_newmodels/LoginModel';

@Injectable({ providedIn: 'root' })
export class AccountService {
  public userSubject: BehaviorSubject<UserLoginResponse>;
  public cimSubject: BehaviorSubject<any>;
  private zohoSubject: BehaviorSubject<string>;
  public userToken: BehaviorSubject<LoginToken>;
  //public userDetails: Observable<UserLoginResponse>;

  public modalRef: BsModalRef;
  private currentuser: UserDetails;
  private genResponse: GenericResponse;
  private roles: ListTypeItem[];
  private password: string;
  private loginModel: LoginModel;
  //companyId: any;


  constructor(
    private router: Router,
    private http: HttpClient,
    private environment: EnvService,
    private roleService: RoleService,
    private listTypeService: ListTypeService,
    private modalService: BsModalService,
    private notificationService: NotificationService,
    private appBasicService: AppBasicService
  ) {
    this.userSubject = new BehaviorSubject<UserLoginResponse>(JSON.parse(sessionStorage.getItem('loginResponse')));
    this.zohoSubject = new BehaviorSubject<string>(JSON.parse(sessionStorage.getItem('zohotoken')));
    this.cimSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("cimdata")));
    //this.userDetails = this.userSubject.asObservable();
    //this.userToken = this.userSubject.value.Token;
    this.notificationService.listen().subscribe((data: any) => {

      const modalOptions: any = {
        backdrop: 'static',
        ignoreBackdropClick: true,
        keyboard: false,
        initialState: {
          //companyId: this.companyId
        },
      }

      setTimeout(() => {
        switch (data) {
          case "cim":
            this.CIMConfig(this.userValue.firstName, this.password, this.userValue.isAdmin)
            break;

          // case "company":
          //   this.modalRef = this.modalService.show(CreateCompanyComponent, modalOptions)
          //   break;

          case "brand":
            this.modalRef = this.modalService.show(CreateBrandComponent, modalOptions)
            break;

          case "businessunit":
            this.modalRef = this.modalService.show(CreateBusinessUnitComponent, modalOptions)
            break;
        }
      }, 1000);

    })
  }

  public get userValue(): UserDetails {
    if (this.userSubject.value != null && this.userSubject.value.userDetails.userRole.toLowerCase() === "admin")
      this.userSubject.value.userDetails.isAdmin = true;

    return this.userSubject.value?.userDetails;
  }

  public get userTokenValue(): LoginToken {
    return this.userSubject.value?.token;
  }


  public get cimValue(): any {
    return this.cimSubject.value;
  }

  public get zohoauthValue(): string {
    return this.zohoSubject.value;
  }

  public GetUserRegions() {
    return this.http.get(`${this.environment.apiUrl}/users/userregions`)
  }

  zohoauthSet(v: string) {
    this.zohoSubject.next(v);
  }


  clear() {
    sessionStorage.removeItem('zohotoken');
    this.zohoSubject.next(null);
  }


  login(login) {
    //password = window.btoa(password);
    return this.http.post(`${this.environment.apiUrl}/Login/login`, login)
      //return this.http.post<User>(`${this.environment.apiUrl}/user/authenticate`, { username, password, companyId, businessUnitId, brandId })
      .pipe(map(response => {
        //sessionStorage.setItem('userDetails', JSON.stringify(response));
        //this.userSubject.next(response);
        return response;
      }));
  }

  ChangeCIM() {

  }


  Authenticate = (email: any, password: any, businessUnitId = "", brandId = "") => {
    this.loginModel = new LoginModel();
    this.loginModel.email = email;
    this.loginModel.password = password;
    this.loginModel.businessUnitId = businessUnitId;
    this.loginModel.brandId = brandId;
    this.login(this.loginModel)
      //this.login(email, password, businessUnitId, brandId)
      .pipe(first()).subscribe({
        next: (data: any) => {
          this.genResponse = data;
          this.userSubject.next(this.genResponse.data);
          sessionStorage.setItem('loginResponse', JSON.stringify(this.genResponse.data));
          sessionStorage.setItem('userDetails', JSON.stringify(this.userValue));
          this.currentuser = this.userValue;
          if (this.currentuser.isAdmin) {
            this.router.navigate(["/"],
              {
                queryParams: { redirected: true, isNSNav: true }
              })
            return this.CIMConfig(email, password, true)
          }
          else {
            this.roleService.getUserRole(this.currentuser.roleId);

            setTimeout(() => {
              this.listTypeService.getById("SEGMENTS")
                .pipe(first()).subscribe((data: any) => {
                  this.roles = data.data;
                  let userrole = this.roles.find(x => x.listTypeItemId == this.currentuser.segmentId)
                  if (userrole == null) return;
                  sessionStorage.setItem('segments', JSON.stringify([userrole]))

                  switch (userrole.itemName) {
                    case "Distributor Support":
                      this.router.navigate(["/"],
                        {
                          queryParams: { redirected: true, isNSNav: true }
                        })
                      this.CIMConfig(email, password, false)
                      break;
                    case "Customer":
                      this.router.navigate(["custdashboard"], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                      break;

                    case "Engineer":
                      this.router.navigate(["engdashboard"], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                      break;
                  }
                });
            }, 1000);
          }

        },
        error: () => false
      });
  }


  CIMConfig(username, password, isAdmin = true) {
    this.password = password
    this.appBasicService.GetModalData()
      .pipe(first()).subscribe({
        next: (data: any) => {
          data = data.data;
          // if (data == null)
          //   return this.notificationService.showError("Some Error Occurred. Please Refresh the page.", "Error")

          const modalOptions: any = {
            backdrop: 'static',
            ignoreBackdropClick: true,
            keyboard: false,
            initialState: {
              username,
              password,
              cimData: data
            },
          }

          if (!isAdmin) {
            //if (isSuperAdmin || (!isAdmin && !isSuperAdmin)) {

            // this.login(username, password, "", "")
            //   .pipe(first()).subscribe(() => {
            this.modalRef = this.modalService.show(CIMComponent, modalOptions);
            this.modalRef.content.onClose.subscribe(result => {
              if (!result.result) {
                //this.companyId = result.companyId;
                return;
              }

              this.cimSubject.next(result.form);
              sessionStorage.setItem("cimdata", JSON.stringify(result.form));
              //debugger;
              //let tempUser = this.userSubject.value;
              // this.userSubject.value.userDetails.selectedBusinessUnitId = result.form.businessUnitId;
              // this.userSubject.value.userDetails.selectedBrandId = result.form.brandId;
              //sessionStorage.setItem('userDetails', JSON.stringify(tempUser));
              //this.userSubject.next(tempUser);
              this.loginModel = new LoginModel();
              this.loginModel.email = username;
              this.loginModel.password = this.password;
              this.loginModel.businessUnitId = result.form.businessUnitId;
              this.loginModel.brandId = result.form.brandId;
              this.login(this.loginModel)
                .pipe(first()).subscribe((data: any) => {

                  this.genResponse = data;
                  this.userSubject.next(this.genResponse.data);
                  sessionStorage.setItem('loginResponse', JSON.stringify(this.genResponse.data));
                  sessionStorage.setItem('userDetails', JSON.stringify(this.userValue));
                  this.currentuser = this.userValue;

                  //     if (isAdmin) this.router.navigate(['/'], {
                  //       //relativeTo: this.activeRoute,
                  //       queryParams: { isNSNav: true },
                  //       //queryParamsHandling: 'merge'
                  //     });
                  //     else {
                  this.router.navigate(['/distdashboard'], {
                    //relativeTo: this.activeRoute,
                    queryParams: { isNSNav: true },
                    //queryParamsHandling: 'merge'
                  });
                  this.notificationService.filter('loggedin');
                  // setTimeout(() => {
                  //   this.router.navigate(['/'], {
                  //     //relativeTo: this.activeRoute,
                  //     queryParams: { isNSNav: true },
                  //     //queryParamsHandling: 'merge'
                  //   });
                  // }, 200);

                  //       }
                })
              // })
            })
          }
          else if (isAdmin) {
            // this.login(username, password, "", "")
            //   .subscribe(() => {
            //     this.currentuser = this.userValue;
            //     if (isAdmin) 
            this.router.navigate(['/'], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
            // else {
            //   this.router.navigate(['/distdashboard'], {
            //     //relativeTo: this.activeRoute,
            //     queryParams: { isNSNav: true },
            //     //queryParamsHandling: 'merge'
            //   })
            this.notificationService.filter('loggedin');
            //   setTimeout(() => {
            //     this.router.navigate(['/'], {
            //       //relativeTo: this.activeRoute,
            //       queryParams: { isNSNav: true },
            //       //queryParamsHandling: 'merge'
            //     });
            //   }, 200);
            // }
            //})
          }

        },
        error: () => this.notificationService.showError("Some Error Occurred. Please Refresh the page.", "Error")
      })
  }


  logout() {
    // remove user from local storage and set current user to null
    sessionStorage.clear();
    this.clear();
    this.userSubject.next(null);
    this.cimSubject.next(null);
    this.router.navigate(['/account/login'], {
      //relativeTo: this.activeRoute,
      queryParams: { isNSNav: true },
      //queryParamsHandling: 'merge'
    });
  }

  register(user: User) {
    return this.http.post(`${this.environment.apiUrl}/Users/create`, user);
  }


  getContactUserStatus(user: User) {
    return this.http.post(`${this.environment.apiUrl}/Users/userbycontactid`, user);
  }


  deactivateuser(user: User) {
    return this.http.put(`${this.environment.apiUrl}/Users/update-status`, user);
  }

  ChangePassword(changePassword: ChangePasswordModel) {
    return this.http.post(`${this.environment.apiUrl}/Users/changepassword`, changePassword);
  }

  ForgotPassword(email: string) {
    return this.http.post(`${this.environment.apiUrl}/Users/forgotpassword/` + email, null);
  }

  getAll() {
    return this.http.get<User[]>(`${this.environment.apiUrl}/Users/all`);
  }

  getById(id: string) {
    return this.http.get<User>(`${this.environment.apiUrl}/user/GetUserByContactId/${id}`);
  }

  update(id, params) {
    return this.http.put(`${this.environment.apiUrl}/users/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        if (id == this.userValue.userId) {
          // update local storage
          const user = { ...this.userValue, ...params };
          sessionStorage.setItem('user', JSON.stringify(user));

          // publish updated user to subscribers
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${this.environment.apiUrl}/users/${id}`)
      .pipe(map(x => {
        // auto logout if the logged in user deleted their own record
        if (id == this.userValue.userId) {
          this.logout();
        }
        return x;
      }));
  }
}

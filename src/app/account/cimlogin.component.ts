import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService, AlertService, NotificationService } from '../_services';
import { CIMAdminLoginService } from '../_services/cimadminlogin.service';
import { LoginModel } from '../_newmodels/LoginModel';
import { BehaviorSubject } from 'rxjs';
import { LoginToken } from '../_newmodels/LoginToken';
import { GenericResponse } from '../_newmodels/GenericResponse';
import { UserDetails, UserLoginResponse } from '../_newmodels/UserDetails';
import { ActivatedRoute, Router } from '@angular/router';

// this is for cim admin to create tenants
@Component({
  templateUrl: 'cimlogin.component.html'
  //styleUrls: ["style.css"]
})

@Injectable({ providedIn: 'root' })
export class CIMLoginComponent implements OnInit {
  public userSubject: BehaviorSubject<UserLoginResponse>;
  //public cimSubject: BehaviorSubject<any>;
  //public userToken: BehaviorSubject<LoginToken>;

  form: FormGroup;
  loading = false;
  submitted = false;
  loginModel: LoginModel;
  //router: any;
  genResponse: GenericResponse;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: CIMAdminLoginService,
    private alertService: AlertService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
  ) { 
    this.userSubject = new BehaviorSubject<UserLoginResponse>(JSON.parse(sessionStorage.getItem('loginResponse')));
    //this.cimSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("cimdata")));
   
  }


  public get userValue(): UserDetails {
    if (this.userSubject.value != null && this.userSubject.value.userDetails.userRole.toLowerCase() === "admin")
      this.userSubject.value.userDetails.isAdmin = true;

    return this.userSubject.value?.userDetails;
  }

  public get userTokenValue(): LoginToken {
    return this.userSubject.value?.token;
  }

  ngOnInit() {
    //debugger;

    if (sessionStorage.getItem('user') !== null) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userprofile');
    }

    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  // ForgotPassword() {
  //   this.bsModalRef = this.modalService.show(ForgotpasswoardComponent);
  // }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.loginModel = new LoginModel();
    this.loginModel.email = this.f.username.value;
    this.loginModel.password = this.f.password.value;
    this.loginModel.businessUnitId = "";
    this.loginModel.brandId = "";
    this.loginService.Adminlogin(this.loginModel)
      .subscribe((data: any) => {
        if (data.isSuccessful) {
          debugger;
          this.genResponse = data;
          this.accountService.userSubject.next(this.genResponse.data);
          //this.userSubject.next(this.genResponse.data);
          sessionStorage.setItem('loginResponse', JSON.stringify(this.genResponse.data));
          this.router.navigate(["/"],
            {
              queryParams: { redirected: true, isNSNav: true }
            })
        }

      })
    setTimeout(() => this.loading = false, 5000);
  }

}

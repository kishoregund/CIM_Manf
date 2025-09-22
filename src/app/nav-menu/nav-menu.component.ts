import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../_models';
import { AccountService } from '../_services';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ChangepasswoardComponent } from "../account/changepasswoard.component";
import { UsernotificationService } from '../_services/usernotification.service';
import { first } from 'rxjs/operators';
import { Environment } from 'ag-grid-community';
import { EnvService } from '../_services/env/env.service';
import { UserDetails, UserLoginResponse } from '../_newmodels/UserDetails';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  //styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  user: UserLoginResponse;
  bsModalRef: BsModalRef;
  notifications: any = 0;
  isAdmin: boolean = false;
  isRoot: boolean = false;
  isSuperAdmin: boolean = false;
  @Output() showNotifications = new EventEmitter<boolean>()
  @Input() isClosed = false;
  notificationList: any[];
  Role: any;
  isDistributor: boolean;
  cimData: any;

  constructor(
    private accountService: AccountService,
    private modalService: BsModalService,
    private userNotification: UsernotificationService,
    private userNotificationService: UsernotificationService,
    private environmentService: EnvService
  ) {

    this.accountService.userSubject.subscribe((data) => this.user = data);
    this.isRoot = this.user.token.isRoot;
    this.accountService.cimSubject.subscribe((data) => this.cimData = data);
    this.isAdmin = this.user.userDetails.isAdmin;

    //this.isSuperAdmin = this.user.isSuperAdmin;
    let role = JSON.parse(sessionStorage.getItem('segments'));

    if (!this.user.userDetails.isAdmin) {
      this.Role = role[0]?.itemCode;
    }

    this.isDistributor = this.Role == environmentService.distRoleCode;

    //[KG]
    // setTimeout(() => {
    //   this.userNotificationService.getAll().pipe(first())
    //     .subscribe((data: any) => {
    //       data.object.length >= 100 ? this.notifications = "99+" : this.notifications = data.object.length
    //     })
    // }, 100);

    // setInterval(() => {
    //   if (this.isClosed) this.closed()
    // }, 1000)
    // this.userNotification.getAll().pipe(first())
    //   .subscribe((data: any) => {
    //     if (data.result) {
    //       this.notificationList = data.object;
    //     }
    //   })

  }

  closed() {
    this.userNotificationService.getAll().pipe(first())
      .subscribe((data: any) => {
        this.notifications = data.object.length
        this.isClosed = false;
      })
  }

  Notifications() {
    this.showNotifications.emit(true)
  }

  ChangePassword() {
    this.bsModalRef = this.modalService.show(ChangepasswoardComponent);
  }

  ToggleDropdown(id: string) {
    document.getElementById(id).classList.toggle("show")
  }

  ClearNotifications() {
    this.userNotification.clearAll().pipe(first())
      .subscribe((data: any) => {
        this.notificationList = []
        this.closed()
      })
  }

  deleteNotification(id) {
    this.userNotification.delete(id).pipe(first())
      .subscribe((data: any) => {
        if (data.result) {
          this.notificationList = data.object;
          this.closed()
        }
      })
  }

  ChangeCIM() {
    if(this.user.userDetails.contactType == "DR")
    {
      // for admin all data is visible
      this.accountService.CIMConfig(this.user.userDetails.email, sessionStorage.getItem('password'), false);
      //this.accountService.CIMConfig(this.user.User.Email, sessionStorage.getItem('password'), this.user.IsAdmin, this.user.isSuperAdmin);
    }
  }

  NewCIMSetup() {
    this.accountService.Authenticate(this.user.userDetails.email, sessionStorage.getItem('password'));
    //this.accountService.Authenticate(this.user.User.Email, sessionStorage.getItem('password'), this.user.companyId);
  }

  logout() {
    this.accountService.logout();
  }
}

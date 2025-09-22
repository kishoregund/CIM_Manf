import { Component } from '@angular/core';

import { ListTypeItem, Profile, User } from '../_models';
import { AccountService, ListTypeService, NotificationService, ProfileService } from '../_services';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetails } from '../_newmodels/UserDetails';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  user: UserDetails;
  profile: Profile;
  roles: ListTypeItem[];
  isRedirected: boolean;

  constructor(
    private accountService: AccountService,
    private profileServicce: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private listTypeService: ListTypeService,
  ) {
    // this.GetCIM()
    this.route.queryParams.subscribe((data: any) => {
      this.isRedirected = data.redirected === "true" || data.redirected === true
    })

    // this.user = this.accountService.userValue;
    // if (!this.user.isAdmin) {
      //[KG]
      // this.profileServicce.getUserProfile(this.user.userProfileId);
      // setTimeout(() => {
      //   this.listTypeService.getById("SEGMENTS")
      //     .pipe(first()).subscribe((data: ListTypeItem[]) => {
      //       this.roles = data;
      //       let userrole = this.roles.find(x => x.listTypeItemId == this.user.roleId)
      //       sessionStorage.setItem('segments', JSON.stringify([userrole]))
      //       if (userrole != null && !this.isRedirected) {
      //         switch (userrole.itemname) {
      //           case "Distributor Support":
      //             this.router.navigate(["distdashboard"], {
      //               //relativeTo: this.activeRoute,
      //               queryParams: { isNSNav: true },
      //               //queryParamsHandling: 'merge'
      //             });
      //             break;

      //           case "Customer":
      //             this.router.navigate(["custdashboard"], {
      //               //relativeTo: this.activeRoute,
      //               queryParams: { isNSNav: true },
      //               //queryParamsHandling: 'merge'
      //             });
      //             break;

      //           case "Engineer":
      //             this.router.navigate(["engdashboard"], {
      //               //relativeTo: this.activeRoute,
      //               queryParams: { isNSNav: true },
      //               //queryParamsHandling: 'merge'
      //             });
      //             break;
      //         }
      //       }
      //     });
      // }, 1000);
    //}

  }
}
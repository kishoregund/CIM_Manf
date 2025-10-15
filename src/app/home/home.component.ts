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
    this.route.queryParams.subscribe((data: any) => {
      this.isRedirected = data.redirected === "true" || data.redirected === true
    })

    this.user = this.accountService.userValue;
    if (!this.user.isAdmin) {
      // setTimeout(() => {        
        switch (this.user.contactType) {
          case "DR":
            debugger;
            if (this.user.segmentCode == "RDTSP" && this.user.selectedBusinessUnitId != "") {
              this.router.navigate(["distdashboard"], {
                queryParams: { isNSNav: true },
              });
            }
            else if (this.user.segmentCode == "RENG"){
              this.router.navigate(["engdashboard"], {
                queryParams: { isNSNav: true },
              });
            }
            break;
          case "CS":
            this.router.navigate(["custdashboard"], {
              queryParams: { isNSNav: true },
            });
            break;
          case "MSR":
            this.router.navigate(["manfdashboard"], {
              queryParams: { isNSNav: true },
            });
            break;
        }       
      // }, 1000);
    }
  }
}
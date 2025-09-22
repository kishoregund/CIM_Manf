import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationStart, ActivatedRoute, Route } from '@angular/router';

import { AccountService, NotificationService } from '../_services';
import { CIMLoginComponent } from '../account/cimlogin.component';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService,
        private cimLoginComponent: CIMLoginComponent
    ) { }

    canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const user = this.accountService.userValue;       
        const adminuser = this.cimLoginComponent.userValue;
        
        if (user || adminuser) {
            // authorised so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}

@Injectable({ providedIn: 'root' })
export class TextValidator implements CanActivate {
    constructor(
        private notificationService: NotificationService
    ) { }

    canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
        setTimeout(() => {
            this.notificationService.ValidateTextInputFields();
        }, 3000);
        return true;
    }
}

@Injectable({ providedIn: 'root' })
export class BrowserBack implements CanActivate {

    constructor(router: Router) {
        router.events
            .subscribe((event: NavigationStart) => {
                if (event.navigationTrigger === 'popstate' || event.navigationTrigger === "imperative") {
                    const currentRoute = router.routerState;
                    const isSafeNavigation = event.url.includes('isNSNav=true');
                    let isNotSafeNavigation = currentRoute.snapshot.url.includes('isNSNav=false');
                    if (isSafeNavigation) { isNotSafeNavigation = false; }
                    if (isNotSafeNavigation) {
                        if (!confirm("You are about to navigate away from the page. Your changes will be discarded.")) {
                            router.navigateByUrl(currentRoute.snapshot.url, { skipLocationChange: true });
                        }
                    }
                }
            });
    }

    canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
        return true;
    }
}


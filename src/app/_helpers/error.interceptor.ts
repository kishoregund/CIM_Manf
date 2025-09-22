import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AccountService, NotificationService } from '../_services';
import { LoaderService } from '../_services/loader.service';
import { EnvService } from '../_services/env/env.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private accountService: AccountService,
        private loaderService: LoaderService,
        private notificationService: NotificationService,
        private environment: EnvService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        //start spinner

        this.loaderService.requestStarted()
        if (request.url.startsWith(this.environment.currencyConvert)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Basic ${btoa("ayushaher494865898:kd0t5dra52rsc50jp4d13642g6")}`
                }
            });
        }

        return this.handler(next, request);
    }

    handler(next, request: HttpRequest<any>) {
        return next.handle(request).pipe(tap((event) => {

            if (event instanceof HttpResponse) {

                // if ((request.method == "POST" || request.method == "PUT") && event.body?.result) {
                //     this.notificationService.SetNavParam();
                // }
                //stop spinner
                this.loaderService.requestEnded()
            }
        }, (err: HttpErrorResponse) => {
            debugger;
            // if ([401, 403].includes(err.status) && this.accountService.userValue) {
            //     // auto logout if 401 or 403 response returned from api
            //     this.accountService.logout();

            //     //stop spinner
            //     this.loaderService.requestEnded()
            //     if (!err.error.isSuccessful) {
            //         this.notificationService.showError(err.error.Messages[0] || "Some error ocurred. Please contact system administrator.", "Error");
            //     }
            // }

            let errMsg ="";
            //stop spinner
            this.loaderService.requestEnded()
            if(err.error?.Messages != null)
                errMsg = err.error?.Messages[0];
            else if(err.error?.messages != null)
                errMsg = err.error?.messages[0];
            else if(err.error != null)
            {
                if(err.error.error != null)
                    errMsg = err.error.error
                else
                    errMsg = err.error;
            }
            else
                errMsg ="Some error ocurred. Please contact system administrator.";

            //console.error(err);
            //this.notificationService.showError(err.error || err.error?.Messages[0] || "Some error ocurred. Please contact system administrator.", "Error")
            this.notificationService.showError(errMsg,"Error");
        }
        ));

    }
}

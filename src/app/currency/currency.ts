import { Component, OnInit } from '@angular/core';

import { Currency, ResultMsg, ProfileReadOnly, User } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, CurrencyService, NotificationService, ProfileService
} from '../_services';
import { UserDetails } from '../_newmodels/UserDetails';


@Component({
  selector: 'app-currency',
  templateUrl: './currency.html',
})
export class CurrencyComponent implements OnInit {
  currencyform: FormGroup;
  currency: Currency
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  currencymodel: Currency;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: UserDetails;
  isEditMode: boolean;
  isNewMode: boolean;
  minorUnit_Length_Error: any;
  formData: { [key: string]: any; };
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private currencyService: CurrencyService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCURR");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }


    this.currencyform = this.formBuilder.group({
      code: ['', [Validators.required, Validators.maxLength(10), Validators.pattern('^[a-zA-Z ]*$')]],
      name: ['', [Validators.required, Validators.maxLength(256), Validators.pattern('^[a-zA-Z ]*$')]],
      minor_Unit: ['', [Validators.required, Validators.min(0), Validators.max(99999)]],
      n_Code: ['', [Validators.min(0), Validators.max(99999)]],
      symbol: [''],
      isDeleted: [false],
    });

    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }
      this.currencyService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.formData = data.data;
            this.currencyform.patchValue(this.formData);
          },
        });
      this.currencyform.disable()
    } else {
      this.isNewMode = true;
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.currencyform.enable();
      this.FormControlEnable();

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
    }
  }

  FormControlEnable() {
    if (this.id == null) return;

    this.currencyform.disable();
    this.currencyform.get('symbol').enable();
  }

  Back() {
    this.router.navigate(["currencylist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.currencyform.patchValue(this.formData);
    else this.currencyform.reset();
    this.currencyform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.currencyService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.router.navigate(["currencylist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
          }
          else {
            this.notificationService.showInfo(data.messages[0], "Info");
          }
        })
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.currencyform.controls; }

  onSubmit() {
    this.submitted = true;
    this.currencyform.markAllAsTouched();

    // stop here if form is invalid
    if (this.currencyform.invalid) {
      return;
    }

    this.currencyform.enable();
    this.currency = this.currencyform.value;
    this.currencyform.disable();

    if (this.id == null) {
      this.currencyService.save(this.currency)
        .pipe(first()).subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(data.messages[0], "Success");
            //this.CancelEdit();
             this.router.navigate(['currencylist'], {
              queryParams: {
                isNSNav: true
              }
            });            
          }
          else this.notificationService.showInfo(data.messages[0], "Info");
        });
    }
    else {
      this.currency.id = this.id;
      this.currencyService.update(this.id, this.currency)
        .pipe(first()).subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(data.messages[0], "Success");
            this.router.navigate(['currencylist'], {
              queryParams: {
                isNSNav: true
              }
            });
          }
          else this.notificationService.showInfo(data.messages[0], "Info");
        });
    }
  }

}

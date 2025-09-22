import { Component, OnInit } from '@angular/core';

import { Country, Currency, ListTypeItem, ResultMsg, ProfileReadOnly, User } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  AccountService, AlertService, CountryService, CurrencyService, ListTypeService, NotificationService, ProfileService
} from '../_services';
import { UserDetails } from '../_newmodels/UserDetails';


@Component({
  selector: 'app-country',
  templateUrl: './country.html',
})
export class CountryComponent implements OnInit {
  user: UserDetails;
  countryform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  country: Country;
  continents: ListTypeItem[];
  currency: Currency[];
  code: string = "CONTI";
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isNewMode: boolean;
  isEditMode: boolean;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private countryService: CountryService,
    private currencyService: CurrencyService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCOUN");
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


    this.countryform = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      iso_2: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      iso_3: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      formal: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      region: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      sub_Region: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      capital: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      continentId: ['', [Validators.required]],
      currencyId: ['', [Validators.required]],
      isDeleted: [false],
    });

    this.listTypeService.getById(this.code)
    .pipe(first())
    .subscribe({
      next: (data: any) => {//ListTypeItem[]) => {
        this.continents = data.data;
      },
    });

    this.countryform.get('iso_2').valueChanges
      .subscribe((data) => {
        this.countryform.get('iso_3').setValue(data);
      })

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currency = data.data;
        }
      });

      this.countryform.get('continentId').valueChanges
      .subscribe((continent) => {
        if(this.continents != null && this.continents != undefined)
        {
          var data = this.continents.find(x => x.listTypeItemId == continent);
          this.countryform.get('region').setValue(data.itemName);
        }
      })


    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }
      this.countryService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.formData = data.data;
            this.countryform.patchValue(this.formData);
          },
        });
      this.countryform.disable()
    } else {
      this.isNewMode = true;
    }

  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.countryform.enable();
      this.FormControlsDisable();

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

  Back() {
    this.router.navigate(["countrylist"]);

  }

  FormControlsDisable() {
    if (this.id == null) return;
    this.countryform.disable();
    this.countryform.get('sub_Region').enable();
    this.countryform.get('formal').enable();
  }


  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.countryform.patchValue(this.formData);
    else this.countryform.reset();
    this.countryform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.countryService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["countrylist"]);
          }
          else {
            this.notificationService.showInfo(data.messages[0], "Info");
          }
        })
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.countryform.controls; }

  onSubmit() {
    debugger;
    this.submitted = true;
    this.countryform.markAllAsTouched();
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.countryform.invalid) {
      return;
    }
    this.countryform.enable();
    this.country = this.countryform.value;
    this.countryform.disable();

    if (this.id == null) {
      this.countryService.save(this.country)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              //this.CancelEdit();
               this.router.navigate(['countrylist'], {
                queryParams: {
                  isNSNav: true
                }
              }); 
            }
            else {
              this.notificationService.showInfo(data.messages[0], "Info");
            }
            this.loading = false;
          }
        });
    }
    else {
      this.country.id = this.id;
      this.countryService.update(this.id, this.country)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.countryform.disable();
              this.router.navigate(['countrylist'], {
                queryParams: {
                  isNSNav: true
                }
              });
            }
            else {
              this.notificationService.showInfo(data.messages[0], "Info");
            }
          }
        });

    }
  }

}

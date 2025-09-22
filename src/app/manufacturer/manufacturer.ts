import { Component, OnInit } from '@angular/core';

import { User, Country, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, CountryService, NotificationService, ProfileService, ListTypeService } from '../_services';
import { Guid } from 'guid-typescript';
import { UserDetails } from '../_newmodels/UserDetails';
import { Manufacturer } from '../_models/manufacturer';
import { ManufacturerService } from '../_services/manufacturer.service';


@Component({
  selector: 'app-manufacturer',
  templateUrl: './manufacturer.html',
})
export class ManufacturerComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  manufacturerModel: Manufacturer;
  loading = false;
  submitted = false;
  isSave = false;
  manufacturerId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;


  isNewSetUp: boolean = false;
  formData: { [key: string]: any; };
  PaymentTermsList: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private manufacturerService: ManufacturerService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService
  ) { }

  ngOnInit() {
    this.manufacturerId = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe((data) => {
      this.isNewSetUp = data.isNewSetUp != null && data.isNewSetUp != undefined;
    });


    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
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


    this.form = this.formBuilder.group({
      manfName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      payterms: ['', Validators.required],
      code: [''],
      isBlocked: false,
      isActive: true,
      isDeleted: [false],
      //address: this.formBuilder.group({
      street: ['', Validators.required],
      area: [''],
      place: ['', Validators.required],
      city: ['', Validators.required],
      addrCountryId: ['', Validators.required],
      zip: ['', Validators.compose([Validators.required, Validators.pattern("^[0-9]{4,15}$"), Validators.minLength(4), Validators.maxLength(15)])],
      geoLat: ['0', [Validators.min(-90), Validators.max(90)]],
      geoLong: ['0', [Validators.min(-180), Validators.max(180)]],
      //isActive: true,
      //}),
    });


    this.listTypeService.getById("GPAYT")
      .subscribe((data: any) => this.PaymentTermsList = data.data);

    this.countryService.getAll()
      .pipe(first()).subscribe({
        next: (data: any) => {
          this.countries = data.data
        }
      });

    if (this.manufacturerId != null) {
      this.hasAddAccess = false;

      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }

      this.manufacturerService.getById(this.manufacturerId)
        .pipe(first()).subscribe((data: any) => {
          this.formData = data.data;
          this.form.patchValue(this.formData);
        });

      this.form.disable()
    }
    else {
      this.isEditMode = true;
    }

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  // get a() {
  //   var controls: any = (this.form.controls.address);
  //   return controls.controls;
  // }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.form.enable();
      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
      this.form.get("code").disable()
    }
  }

  Back() {
    this.router.navigate(["manufacturerlist"]);
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.manufacturerId != null) this.form.patchValue(this.formData);
    else this.form.reset();
    this.form.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.manufacturerService.delete(this.manufacturerId).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["manufacturerlist"], {
              queryParams: { isNSNav: true },
            });
          }
          else {
            this.notificationService.showInfo(data.messages[0], "Info");
          }
        })
    }
  }


  onSubmit() {
    this.submitted = true;
    this.form.markAllAsTouched()
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    if (this.manufacturerId == null) {
      this.manufacturerId = Guid.create().toString();
      this.manufacturerModel = this.form.value;
      this.manufacturerModel.id = this.manufacturerId;
      this.manufacturerService.save(this.manufacturerModel)
        .subscribe((data: any) => {
          if (!data.isSuccessful) return;
          this.router.navigate(['manfsalesregion', this.manufacturerId], {
            queryParams: {
              isNSNav: true
              //isNewDist: true
            }
          });
          // sessionStorage.setItem("distributor", JSON.stringify(this.manufacturerModel));
          // this.router.navigate([`/contact/${this.type}/${this.manufacturerId}`], {
          //   queryParams: {
          //     isNewDistSetUp: true,
          //     isNSNav: true
          //   }
          // })
        });
    }
    else {
      this.manufacturerModel = this.form.value;
      this.manufacturerModel.id = this.manufacturerId;
      this.manufacturerService.update(this.manufacturerId, this.form.value)
        .pipe(first()).subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(data.messages[0], "Success");
            this.router.navigate(["manufacturerlist"], {
              queryParams: {
                isNewMode: true,
                isNSNav: true
              }
            });
          }
          else this.notificationService.showInfo(data.messages[0], "Info");

        });
    }


  }

}

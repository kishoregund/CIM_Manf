import { Component, OnInit } from '@angular/core';

import { User, Country, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, ProfileService, CountryService, NotificationService, ListTypeService } from '../_services';
import { Guid } from 'guid-typescript';
import { UserDetails } from '../_newmodels/UserDetails';
import { ManufacturerSalesRegion } from '../_models/manufacturerSalesRegion';
import { Manufacturer } from '../_models/manufacturer';
import { ManufacturerService } from '../_services/manufacturer.service';
import { ManufacturerSalesRegionService } from '../_services/manufacturerSalesRegion.service';


@Component({
  selector: 'app-manfsalesregion',
  templateUrl: './manfsalesregion.html',
})
export class ManufacturerSalesRegionComponent implements OnInit {
  user: UserDetails;
  manufacturerRegionform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  countries: Country[];
  manufacturers: Manufacturer[];
  manfSalesRegion: ManufacturerSalesRegion;
  manufacturerSalesRegionId: string;
  manufacturerId: string;
  type: string = "MSR";
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isEditMode: boolean;
  isNewMode: boolean;
  isNewSetup: boolean;
  formData: any;
  manufacturerName: any;
  isNewParentMode: boolean;
  PaymentTermsList: any;
  isPrincipal: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private countryService: CountryService,
    private alertService: AlertService,
    private manufacturerService: ManufacturerService,
    private manufacturerSalesRegionService: ManufacturerSalesRegionService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SMANF");
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

    this.manufacturerRegionform = this.formBuilder.group({
      manfId: ['', Validators.required],
      manfName: ['', [Validators.required]],
      //region: ['', Validators.required],
      salesRegionName: ['', Validators.required],
      payTerms: ['', Validators.required],
      isBlocked: false,
      isActive: true,
      isPrincipal: false,
      countries: ["", Validators.required],
      isDeleted: [false],
      street: ['', Validators.required],
      area: [""],
      place: ['', Validators.required],
      city: ['', Validators.required],
      addrCountryId: ['', Validators.required],
      zip: ['', Validators.compose([Validators.required, Validators.pattern("^[0-9]{4,15}$"), Validators.minLength(4), Validators.maxLength(15)])],
      geoLat: ['0', [Validators.min(-90), Validators.max(90)]],
      geoLong: ['0', [Validators.min(-180), Validators.max(180)]],
    });

    debugger;
    this.countryService.getAll()
      .pipe(first()).subscribe((data: any) => this.countries = data.data);

    // this.manufacturerService.getAll()
    //   .pipe(first()).subscribe((data: any) => this.manufacturers = data.data);

    this.manufacturerId = this.route.snapshot.paramMap.get('id');
    this.manufacturerSalesRegionId = this.route.snapshot.paramMap.get('rid');

    this.listTypeService.getById("GPAYT")
      .subscribe((data: any) => this.PaymentTermsList = data.data);

    this.route.queryParams.subscribe((data) => {
      this.isNewSetup = data.isNewSetUp != null && data.isNewSetUp != undefined;
      this.isNewParentMode = data.isNewDist != null && data.isNewDist != undefined && data.isNewDist == "true";
    });

    this.manufacturerRegionform.controls['manfId'].setValue(this.manufacturerId, { onlySelf: true });

    if (!this.isNewParentMode && this.manufacturerId != null) {
      this.manufacturerService.getById(this.manufacturerId)
        .subscribe((data: any) => {
          this.isPrincipal = false;
          this.manufacturerName = data.data.manfName;
          this.manufacturerRegionform.controls['addrCountryId'].setValue(data.data.addrCountryId, { onlySelf: true });
          this.manufacturerRegionform.controls['manfName'].setValue(this.manufacturerName, { onlySelf: true });
        })
    }
    else if (this.isNewParentMode && this.manufacturerId != null) {
      this.manufacturerService.getById(this.manufacturerId)
        .subscribe((data: any) => {
          if (!data.isSuccessful) return;
          data = data.data;
          setTimeout(() => {
            this.manufacturerName = data.manfname;
            this.isPrincipal = true;
            this.manufacturerRegionform.controls['manfName'].setValue(this.manufacturerName, { onlySelf: true });
            this.manufacturerRegionform.controls['salesRegionName'].setValue(data.salesRegionName, { onlySelf: true });
            //this.manufacturerRegionform.controls['region'].setValue(this.countries.find(x => x.id == data.countryId)?.formal, { onlySelf: true });
            this.manufacturerRegionform.controls['countries'].setValue(data.countryId, { onlySelf: true });
            this.manufacturerRegionform.controls['payTerms'].setValue(data.payTerms, { onlySelf: true });
            this.manufacturerRegionform.controls['street'].setValue(data.street, { onlySelf: true });
            this.manufacturerRegionform.controls['city'].setValue(data.city, { onlySelf: true });
            this.manufacturerRegionform.controls['state'].setValue(data.state, { onlySelf: true });
            this.manufacturerRegionform.controls['addrCountryId'].setValue(data.addrCountryId, { onlySelf: true });
            this.manufacturerRegionform.controls['zip'].setValue(data.zip, { onlySelf: true });
            this.manufacturerRegionform.controls['geoLat'].setValue(data.geoLat, { onlySelf: true });
            this.manufacturerRegionform.controls['geoLong'].setValue(data.geoLong, { onlySelf: true });
            //this.manufacturerRegionform.get("address").patchValue(data.address)
          }, 300);
        })
    }

    if (this.manufacturerSalesRegionId != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }
      this.manufacturerSalesRegionService.getById(this.manufacturerSalesRegionId)
        .pipe(first()).subscribe({
          next: (data: any) => {
            debugger;
            this.formData = data.data;
            this.manufacturerRegionform.patchValue(this.formData);
            this.isPrincipal = data.data.isPrincipal;
          },
        });
      this.manufacturerRegionform.disable();
    }
    else {
      this.isNewMode = true;
      this.isPrincipal = false;
    }


    // this.manufacturerRegionform.get("countries").valueChanges
    //   .subscribe((data: any) => {
    //     if(data != null)
    //     {
    //       this.manufacturerRegionform.get("countries").setValue(data);
    //     }
    //   })
  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.manufacturerRegionform.enable();
      this.manufacturerRegionform.get("manfName").disable();
      this.manufacturerRegionform.get("isPrincipal").disable();
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
    this.router.navigate(["manfsalesregionlist", this.manufacturerId]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.manufacturerSalesRegionId != null) this.manufacturerRegionform.patchValue(this.formData);
    else {
      this.manufacturerRegionform.reset();
      setTimeout(() => {
        this.manufacturerRegionform.get("manfId").setValue(this.manufacturerId)
        this.manufacturerRegionform.get("manfName").setValue(this.manufacturerName)
      }, 200);
    }
    this.manufacturerRegionform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.manufacturerSalesRegionService.delete(this.manufacturerSalesRegionId).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["manfsalesregionlist", this.manufacturerId], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
          }
          else
            this.notificationService.showInfo(data.messages[0], "Info");
        })
    }
  }



  // convenience getter for easy access to form fields
  get f() {
    return this.manufacturerRegionform.controls;
  }

  // get a() {
  //   var controls: any = (this.manufacturerRegionform.controls.address);
  //   return controls.controls;
  // }

  onSubmit() {
    console.log(this.manufacturerRegionform);

    this.manufacturerRegionform.markAllAsTouched()
    //if (this.manufacturerRegionform.invalid) return;

    this.manfSalesRegion = this.manufacturerRegionform.value;
    if (this.manufacturerSalesRegionId == null) {
      this.manufacturerSalesRegionId = Guid.create().toString()
      this.manfSalesRegion.id = this.manufacturerSalesRegionId
      this.manfSalesRegion.isPrincipal = this.isPrincipal;
      this.manufacturerSalesRegionService.save(this.manfSalesRegion)
        .subscribe((data: any) => {
          if (!data.isSuccessful) {
            return;
          }
          this.router.navigate(['contact', this.type, this.manufacturerId, this.manfSalesRegion.id], {
            queryParams: {
              isNewMode: true,
              isNSNav: true
            }
          });
        })

    }
    else {
      this.manfSalesRegion.id = this.manufacturerSalesRegionId;
      this.manufacturerSalesRegionService.update(this.manufacturerSalesRegionId, this.manfSalesRegion)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.router.navigate(["manfsalesregionlist", this.manufacturerId],
                {
                  queryParams: { isNSNav: true },
                });
            }
            this.loading = false;
          },
        });
    }
  }

}

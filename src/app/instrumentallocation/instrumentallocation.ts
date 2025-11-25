import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import {
  ConfigTypeValue,
  Contact,
  CustomerSite,
  Distributor,
  FileShare,
  Instrument,
  ProfileReadOnly
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import * as $ from 'jquery'

import {
  AccountService,
  AlertService,
  NotificationService,
  ProfileService,
  UploadService

} from '../_services';
import { DomSanitizer } from "@angular/platform-browser";
import { DatePipe } from "@angular/common";
import { EnvService } from '../_services/env/env.service';
import { BusinessUnitService } from '../_services/businessunit.service';
import { BrandService } from '../_services/brand.service';
import { GetParsedDate } from '../_helpers/Providers';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { InstrumentAccessoryService } from '../_services/InstrumentAccessory.Service';
import { parseHostBindings } from '@angular/compiler';
import { UserDetails } from '../_newmodels/UserDetails';
import { InstrumentService } from '../_services/instrument.service';
import { ManufacturerService } from '../_services/manufacturer.service';
import { Guid } from 'guid-typescript';
import { InstrumentAllocationService } from '../_services/instrumentallocation.service';
import { DistributorService } from '../_services/distributor.service';
import { InstrumentAllocation } from '../_models/instrumentallocation';
import { BUBrandModel } from '../_newmodels/BUBrandModel';

@Component({
    selector: 'app-instrumentallocation',
    templateUrl: './instrumentallocation.html',
    standalone: false
})
export class InstrumentAllocationComponent implements OnInit {
  user: UserDetails;
  instrumentallocationform: FormGroup;
  instrumentallocation: InstrumentAllocation;
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  code: string = "CONTY";
  engList: Contact[];
  imagePath: any;
  pdfPath: any;
  pdfFileName: string;
  contactList: Contact[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasCommercial: boolean = false;

  transaction: number;
  hastransaction: boolean;
  datepipie = new DatePipe("en-US");
  isEditMode;
  isNewMode: boolean;
  instrumentList: Instrument;
  businessUnitList: any[];
  brandList: any[];
  distributorList: any[];
  formData: any;
  role: any;
  buBrandModel: BUBrandModel;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private instrumentService: InstrumentService,
    private profileService: ProfileService,
    private businessUnitService: BusinessUnitService,
    private instrumentAllocationService: InstrumentAllocationService,
    private distributorService: DistributorService,
    private notificationService: NotificationService,
    private enviroment: EnvService,
    private brandService: BrandService,
  ) {

    this.instrumentallocationform = this.formBuilder.group({
      isActive: true,
      isDeleted: [false],
      instrumentId: ['', Validators.required],
      distributorId: ['', Validators.required],
      businessUnitId: ["", Validators.required],
      brandId: ["", Validators.required],
    });

  }

  ngOnInit() {
    this.transaction = 0;
    this.user = this.accountService.userValue;

    let role = JSON.parse(sessionStorage.getItem('segments'));
    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SINAL");
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
    else {
      this.role = role[0]?.itemCode;
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
      this.hasUpdateAccess = false;
      this.hasReadAccess = true;
    }

    this.id = this.route.snapshot.paramMap.get('id');

    this.buBrandModel = new BUBrandModel();
    this.buBrandModel.businessUnitId = "";
    this.buBrandModel.brandId = "";
    this.instrumentService.getAll(this.buBrandModel).subscribe((data: any) => {
      this.instrumentList = data.data;
    })


    this.distributorService.getAll()
      .pipe(first()).subscribe((data: any) => {
        this.distributorList = data.data;
      });

    this.instrumentallocationform.get("distributorId").valueChanges
      .subscribe((value: any) => {
        if (value != "") {
          this.businessUnitService.GetByDistId(value)
            .pipe(first()).subscribe((data: any) => {
              this.businessUnitList = data.data;         
            })
        }
      })

    this.instrumentallocationform.get("businessUnitId").valueChanges
      .subscribe((value: any) => {
        if (value != "") {
          this.brandService.GetByBU(value)
            .pipe(first()).subscribe((data: any) => {
              this.brandList = data.data;
            })
        }
      })

    if (this.id != null) {

      this.instrumentAllocationService.getById(this.id)
        .pipe(first()).subscribe((data: any) => {

          debugger;
          this.formData = data.data;
          this.instrumentallocationform.patchValue(this.formData);
        });
      setTimeout(() => this.instrumentallocationform.disable(), 1000);
    }
    else {
      this.isNewMode = true
      setTimeout(() => this.FormControlDisable(), 1000);
    }

  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge',
        });

      this.instrumentallocationform.enable();
      this.FormControlDisable();
    }
  }

  Back() {
    this.router.navigate(["instrumentallocationlist"]);
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.instrumentallocationform.patchValue(this.formData);
    else this.instrumentallocationform.reset();
    this.instrumentallocationform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
  }

  FormControlDisable() {
    // this.instrumentallocationform.get('instrumentId').disable()
    // this.instrumentallocationform.get('distributorId').disable()
    // this.instrumentallocationform.get('businessUnitId').disable()
    // this.instrumentallocationform.get('brandId').disable()
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.instrumentService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["instrumentallocationlist"], {
              queryParams: {
                isNSNav: true
              }
            })
          }
          else
            this.notificationService.showInfo(data.messages[0], "Info");
        })
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.instrumentallocationform.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();
    this.instrumentallocationform.markAllAsTouched();

    this.isSave = true;
    this.loading = true;
    this.instrumentallocationform.enable();
    this.instrumentallocation = this.instrumentallocationform.value;
    this.FormControlDisable();

    debugger;

    if (this.id == null) {
      this.instrumentAllocationService.save(this.instrumentallocation)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.router.navigate(["instrumentallocationlist"], {
                queryParams: {
                  isNSNav: true
                }
              });
            }
            else this.notificationService.showError(data.messages[0], "Error")
            this.loading = false;
          },
        });
    }
    else {
      debugger;
      this.instrumentallocation.id = this.id;
      this.instrumentAllocationService.update(this.id, this.instrumentallocation)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {

              this.notificationService.showSuccess(data.messages[0], "Success");
              this.router.navigate(["instrumentallocationlist"], {
                queryParams: {
                  isNSNav: true
                }
              });
            }

            else this.notificationService.showError(data.messages[0], "Error")

            this.loading = false;

          },
        });
    }
  }

}

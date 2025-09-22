import { Component, OnInit } from '@angular/core';

import { User, Customer, CustomerSite, Country, DistributorRegion, ResultMsg, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, CountryService, ProfileService, NotificationService, ListTypeService } from '../_services';
import { Guid } from 'guid-typescript';
import { UserDetails } from '../_newmodels/UserDetails';
import { CustomerSiteService } from '../_services/customersite.service';
import { CustomerService } from '../_services/customer.service';
import { DistributorRegionService } from '../_services/distRegion.service';


@Component({
  selector: 'app-customersite',
  templateUrl: './customersite.html',
})
export class CustomerSiteComponent implements OnInit {
  user: UserDetails;
  customersiteform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  customers: Customer[];
  type: string = "CS";
  csiteId: string;
  customerId: string;
  custSite: CustomerSite;
  countries: Country[];
  distRegions: DistributorRegion[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isNewMode: boolean;
  isEditMode: boolean;
  formData: any;
  customerName: string
  PaymentTermsList: any;
  isNewParentMode: boolean;
  distRegion: any;
  customer: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private countryService: CountryService,
    private distributorRegionservice: DistributorRegionService,
    private customersiteService: CustomerSiteService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService
  ) {
    this.customersiteform = this.formBuilder.group({
      customerId: ['', Validators.required],
      custName: ['', Validators.required],
      regName: [''],
      custRegName: ['', Validators.required],
      distId: ['', Validators.required],
      regionId: ['', Validators.required],
      payTerms: ['', Validators.required],
      isBlocked: false,
      //address: this.formBuilder.group({
      street: ['', Validators.required],
      area: [""],
      place: ['', Validators.required],
      city: ['', Validators.required],
      countryId: ['', Validators.required],
      zip: ['', Validators.compose([Validators.pattern("^[0-9]{4,15}$"), Validators.minLength(4), Validators.maxLength(15)])],
      geoLat: ['0', [Validators.min(-90), Validators.max(90)]],
      geoLong: ['0', [Validators.min(-180), Validators.max(180)]],
      isActive: true,
      //}),
    });

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
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
      this.hasReadAccess = true;
      this.hasUpdateAccess = true;
    }


    this.customerId = this.route.snapshot.paramMap.get('id');
    this.csiteId = this.route.snapshot.paramMap.get('cid');

    this.route.queryParams.subscribe((data) => {
      
      this.isNewParentMode = data.isNewCust != null && data.isNewCust != undefined && data.isNewCust == "true";
      //this.isNewParentMode = data.isNewParentMode != null && data.isNewParentMode != undefined && data.isNewParentMode == "true";
    });

    this.listTypeService.getById("GPAYT")
      .subscribe((data: any) => this.PaymentTermsList = data.data);

    this.customersiteService.getDistRegionsByCustId(this.customerId)
      .subscribe((data: any) => {
        if (!data.isSuccessful || !data.data) return;
        if (this.isNewParentMode) {
          this.distRegions = data.data;
          this.distRegion = data.data;
          this.customersiteform.get('regName').setValue(data.data.region)
          this.customersiteform.get('payTerms').setValue(data.data.payTerms)
        }
        else this.distRegions = data.data

      });

    this.customerService.getById(this.customerId)
      .subscribe((data: any) => {
        //this.customers = data.data;
        //this.customer = this.customers.find(x => x.id == this.customerId);
        this.customer = data.data;
        var customer: any = this.customer;

        this.customersiteform.get("customerId").setValue(this.customerId)

        if (customer) {
          this.customerName = customer.custname
          if (customer.defDistRegion && !this.csiteId) this.customersiteform.get('regName').setValue(customer.defDistRegion)
          if (customer.custName) this.customersiteform.get('custName').setValue(customer.custName)
          if (customer.defDistRegionId && !this.csiteId) {
            this.customersiteform.get('distId').setValue(customer.defDistId);
            this.customersiteform.get('regionId').setValue(customer.defDistRegionId);
          }
          //this.customersiteform.patchValue({ address: customer.address })
          this.countryService.getAll()
            .subscribe((data: any) => {
              this.countries = data.data;
              var siteName = this.countries.find(x => x.id == customer.countryId)?.name
              if (!this.csiteId) this.customersiteform.get('custRegName').setValue(siteName)
            });
        }
      });

    if (this.csiteId != null) {
      this.hasAddAccess = false;
      if (this.user.isAdmin) {
        this.hasAddAccess = true;
      }
      debugger;
      this.customersiteService.getById(this.csiteId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.formData = data.data;
            this.customersiteform.patchValue(this.formData);
          },
        });
      this.customersiteform.disable()
    } else {
      this.isNewMode = true
    }

  }


  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;
      this.customersiteform.enable();
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
    this.router.navigate(["customersitelist", this.customerId]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.csiteId != null) this.customersiteform.patchValue(this.formData);
    else {
      this.customersiteform.reset();
      setTimeout(() => {
        this.customersiteform.get('regName').setValue(this.distRegion.region);
        this.customersiteform.get('payTerms').setValue(this.distRegion.payTerms);

        if (this.customer.defDistRegion) this.customersiteform.get('regName').setValue(this.customer.defDistRegion)
        if (this.customer.custName) this.customersiteform.get('custName').setValue(this.customer.custName)
        if (this.customer.defDistRegionId) {
          this.customersiteform.get('distId').setValue(this.customer.defDistId);
          this.customersiteform.get('regionId').setValue(this.customer.defDistRegionId);
        }
      }, 500);
    }
    this.customersiteform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.customersiteService.delete(this.csiteId).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["customersitelist", this.customerId], {
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


  showallDdl(value: boolean) {
    //debugger;
    if (value == true) {
      this.distributorRegionservice.getAllAssigned()
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distRegions = data.data;
          },
        });
    }
    else {
      //this.distributorRegionservice.getDistByCustomerId(this.customerId)
      this.customersiteService.getDistRegionsByCustId(this.customerId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.distRegions = data.data;
          },
        });
    }
  }


  // convenience getter for easy access to form fields
  get f() {
    return this.customersiteform.controls;
  }

  // get a() {
  //   var controls: any = (this.customersiteform.controls.address);
  //   return controls.controls;
  // }

  onSubmit() {
    this.customersiteform.markAllAsTouched()

    if (this.customersiteform.invalid) return;

    if (this.csiteId == null) {
      this.custSite = this.customersiteform.value;
      this.csiteId = Guid.create().toString();
      this.custSite.id = this.csiteId;
      this.customersiteService.save(this.custSite)
        .subscribe((data: any) => {
          if (!data.isSuccessful) return;
          // sessionStorage.setItem("site", JSON.stringify(this.custSite));
          return this.router.navigate(['contact', this.type, this.customerId, this.csiteId], {
            queryParams: {
              isNewMode: true,
              isNSNav: true
            }
          })
        });
    }
    else {
      this.custSite = this.customersiteform.value;
      this.custSite.id = this.csiteId;
      this.customersiteService.update(this.csiteId, this.custSite)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.router.navigate(["customersitelist", this.customerId], {
                queryParams: {
                  isNSNav: true
                }
              })
            }
            this.loading = false;
          },
        });
    }
  }
}

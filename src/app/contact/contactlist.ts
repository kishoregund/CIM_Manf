import { Component, OnInit } from '@angular/core';

import { Contact, Country, ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  AlertService,
  CountryService,
  NotificationService,
  ProfileService
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { UserDetails } from '../_newmodels/UserDetails';
import { ContactService } from '../_services/contact.service';
import { CustomerService } from '../_services/customer.service';
import { CustomerSiteService } from '../_services/customersite.service';
import { DistributorRegionService } from '../_services/distRegion.service';
import { DistributorService } from '../_services/distributor.service';
import { ManufacturerSalesRegionService } from '../_services/manufacturerSalesRegion.service';


@Component({
  selector: 'app-contactlist',
  templateUrl: './contactlist.html',
})
export class ContactListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  contactList: Contact[];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  masterId: string;
  detailId: string;
  countries: Country[];
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private contactService: ContactService,
    private countryService: CountryService,
    private distributorService: DistributorService,
    private customerService: CustomerService,
    private distRegionService: DistributorRegionService,
    private customerSiteService: CustomerSiteService,
    private manfSalesRegionService: ManufacturerSalesRegionService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) {

  }

  ngOnInit() {
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.masterId = this.route.snapshot.paramMap.get('id');
    this.detailId = this.route.snapshot.paramMap.get('cid');
    this.type = this.route.snapshot.paramMap.get('type');

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      if (this.type == "DR" || this.type == "D") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }

      if (this.type == "C" || this.type == "CS") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }

      if (this.type == "M" || this.type == "MSR") {
        let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SMANF");
        if (profilePermission.length > 0) {
          this.hasReadAccess = profilePermission[0].read;
          this.hasAddAccess = profilePermission[0].create;
          this.hasDeleteAccess = profilePermission[0].delete;
          this.hasUpdateAccess = profilePermission[0].update;
        }
      }
    }

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }

    if (this.type == "DR" || this.type == "CS" || this.type == "MSR") {
      this.columnDefs = this.createColumnDefsForDetail();
    }
    else {
      this.columnDefs = this.createColumnDefs();
    }
    if (this.type == "D") {
      this.distributorService.getById(this.masterId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactList = data.data?.contacts || [];
          },
          error: error => {
            this.loading = false;
          }
        });
    }
    else if (this.type == "DR") {
      debugger;
      this.distRegionService.getById(this.detailId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactList = data.data?.regionContacts || [];
          },
          error: error => {
            this.loading = false;
          }
        });
      // this.contact.contactMapping.mappedFor = "REG";
    }
    else if (this.type == "C") {
      this.customerService.getById(this.masterId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactList = data.data?.contacts || [];
          },
          error: error => {
            this.loading = false;
          }
        });
    }
    else if (this.type == "CS") {
      //this.contact.contactMapping.mappedFor = "SITE";
      this.customerSiteService.getById(this.detailId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.contactList = data.data?.siteContacts || [];
          },
          error: error => {
            this.loading = false;
          }
        });
    }
    else if (this.type == "MSR") {
      this.manfSalesRegionService.getById(this.detailId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            debugger;
            this.contactList = data.data?.salesRegionContacts || [];
          },
          error: error => {
            this.loading = false;
          }
        });
    }
  }

  Add() {
    //debugger;
    if (this.type == "DR" || this.type == "CS" || this.type == "MSR") {
      this.router.navigate(['contact', this.type, this.masterId, this.detailId]);
    }
    else {
      this.router.navigate(['contact', this.type, this.masterId]);
    }
  }


  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    if (this.type == "DR" || this.type == "CS" || this.type == "MSR") {
      this.router.navigate(['contact', this.type, this.masterId, this.detailId, data.id], {
        queryParams: {
          isNSNav: true,
          creatingNewDistributor: true
        },
      });
    }
    else {
      this.router.navigate(['contact', this.type, this.masterId, data.id], {
        queryParams: {
          isNSNav: true,
          creatingNewDistributor: true
        },
      });
    }
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'First Name',
        field: 'firstname',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'firstname',
      }, {
        headerName: 'Last Name',
        field: 'lastname',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'lastname',
      }, {
        headerName: 'Email',
        field: 'primaryEmail',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'primaryEmail',
      },
      {
        headerName: 'Is Active',
        field: 'isActive',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'isActive'
      }
    ]
  }

  private createColumnDefsForDetail() {
    return [{
      headerName: 'First Name',
      field: 'firstName',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'firstName',
    }, {
      headerName: 'Last Name',
      field: 'lastName',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'lastName',
    }, {
      headerName: 'Email',
      field: 'primaryEmail',
      filter: true,
      editable: false,
      sortable: true,
      tooltipField: 'primaryEmail',
    },
    {
      headerName: 'Is Active',
      field: 'isActive',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'isActive'
    }
    ]
  }


  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}

import { Component, OnInit } from '@angular/core';

import { CustomerSite, ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,  
  ProfileService
} from '../_services';
import { UserDetails } from '../_newmodels/UserDetails';
import { CustomerService } from '../_services/customer.service';


@Component({
  selector: 'app-customerls',
  templateUrl: './customersitelist.html',
})
export class CustomerSiteListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  customerSite: any[] = [];
  loading = false;
  submitted = false;
  isSave = false;
  customerSiteId: string;
  customerId: string;
  type: string = "D";
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private customerService: CustomerService,
    private profileService: ProfileService,
  ) {

  }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCUST");
      if (profilePermission.length > 0) {

        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;

      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }

    this.customerId = this.route.snapshot.paramMap.get('id');
    this.customerService.getById(this.customerId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          debugger;
          if (this.user.contactType?.toLocaleLowerCase() == "C") {
            this.customerSite = [];
            let siteLst = this.user.custSites?.split(",")
            data.data?.sites.forEach(element => {
              if (siteLst?.length > 0 && siteLst?.find(x => x == element.id) == null) return;
              this.customerSite.push(element);
            })
          }
          else if (this.user.contactType == "CS") {
            this.customerSite = data.data.sites;
            data.data.sites.forEach(x => {
              x.contacts.forEach(y => {
                if (y.id == this.user.contactId) {
                  this.customerSite = []
                  this.customerSite.push(x)
                }
              });
            })
          }
          else {
            this.customerSite = data.data.sites;
          }
        },
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['customersite', this.customerId], {
      queryParams: {
        isNSNav: false
      },
    });
  }


  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate(['/customersite/' + this.customerId + `/${data.id}`], {
      queryParams: {
        isNSNav: true,
        creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Customer Site',
        field: 'custRegName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'custRegName',
      }, {
        headerName: 'Region',
        field: 'regName',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'regName',
      },

    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}

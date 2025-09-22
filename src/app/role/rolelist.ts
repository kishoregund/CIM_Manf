import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService,  NotificationService } from '../_services';
//InstrumentService,
//import { RenderComponent } from '../distributor/rendercomponent';
import { UserDetails } from '../_newmodels/UserDetails';
import { Role, RoleReadOnly } from '../_models/role';
import { RoleService } from '../_services/role.service';


@Component({
  selector: 'app-instuList',
  templateUrl: './rolelist.html',
})
export class RoleListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  roleList: Role[];
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  rolePermission: RoleReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    //private instrumentService: InstrumentService,
    private countryService: CountryService,
    private notificationService: NotificationService,
    private roleService: RoleService
  ) {

  }

  ngOnInit() {
    //debugger;
    this.user = this.accountService.userValue;
    this.rolePermission = this.roleService.userRoleValue;
    if (this.rolePermission != null) {
      let rolePermission = this.rolePermission.permissions.filter(x => x.screenCode == "PROF");
      if (rolePermission.length > 0) {
        this.hasAddAccess = rolePermission[0].create;
        this.hasDeleteAccess = rolePermission[0].delete;
      }
    }

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.roleService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          //debugger;
          this.roleList = data.data;
        },
        error: error => {

          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['role'], {
      queryParams: {
        isNSNav: false
      },
    });
  }


  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`role/${data.id}`], {
      queryParams: {
        isNSNav: true
        //creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [{
      headerName: 'Role Name',
      field: 'name',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'name',
    },
    {
      headerName: 'Description',
      field: 'description',
      filter: true,
      enableSorting: true,
      sortable: true,
      tooltipField: 'description',
    }]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }
}

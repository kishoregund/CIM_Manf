import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { EnvService } from '../_services/env/env.service';
import { InstrumentService } from '../_services/instrument.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { BUBrandModel } from '../_newmodels/BUBrandModel';
import { InstrumentAllocationService } from '../_services/instrumentallocation.service';


@Component({
    selector: 'app-installocationList',
    templateUrl: './instrumentallocationlist.html',
    standalone: false
})
export class InstrumentAllocationListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  instrumentAllocationList: any;
  loading = false;
  submitted = false;
  isSave = false;
  customerId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  
  private api: GridApi;
  filterData: any;
  showGrid = true;
  isDist: boolean = false;
  isEng: boolean = false;
  isCust: boolean = false;
  isManf: boolean = false;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
    private instrumentAllocationService: InstrumentAllocationService,
    private environment: EnvService
  ) {

  }

  ngOnInit() {
    let role = JSON.parse(sessionStorage.getItem('segments'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SINAL");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.isAdmin) {      
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    else {
      role = role[0]?.itemCode;
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
    }

    if (role == this.environment.distRoleCode) this.isDist = true;
    else if (role == this.environment.engRoleCode) this.isEng = true;
    else if (role == this.environment.custRoleCode) this.isCust = true;
    else if (role == this.environment.manfRoleCode) this.isManf = true;

    this.instrumentAllocationService.getAll().pipe(first())
      .subscribe((data: any) => {
        debugger;
        this.instrumentAllocationList = data.data
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['instrumentallocation'], {
      queryParams: {
        isNSNav: false
      },
    });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`instrumentallocation/${data.id}`], {
      queryParams: {
        isNSNav: true
      },
    })
  }

  DataFilter(event) {
    this.instrumentAllocationList = event
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Instrument',
        field: 'instrument',
        filter: true,
        sortable: true,
        tooltipField: 'Instrument'
      },
      {
        headerName: 'Distributor',
        field: 'distributorName',
        filter: true,
        sortable: true,
        tooltipField: 'Distributor'
      },
      {
        headerName: 'Business Unit',
        field: 'businessUnit',
        filter: true,
        sortable: true,
        tooltipField: 'Business Unit'
      },
      {
        headerName: 'Brand',
        field: 'brandName',
        filter: true,
        sortable: true,
        tooltipField: 'Brand'
      },
      
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    
    this.api.sizeColumnsToFit();
  }

}

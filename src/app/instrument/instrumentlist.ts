import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { EnvService } from '../_services/env/env.service';
import { InstrumentService } from '../_services/instrument.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { BUBrandModel } from '../_newmodels/BUBrandModel';


@Component({
  selector: 'app-instuList',
  templateUrl: './instrumentlist.html',
})
export class InstrumentListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  instrumentList: Instrument[];
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
  private columnApi: ColumnApi;
  private api: GridApi;
  filterData: any;
  showGrid = true;
  buBrandModel: BUBrandModel;
  isDist: boolean = false;
  isEng: boolean = false;
  isCust: boolean = false;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
    private instrumentService: InstrumentService,
    private environment: EnvService
  ) {

  }

  ngOnInit() {
    let role = JSON.parse(sessionStorage.getItem('segments'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SINST");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
    }
    else {
      role = role[0]?.itemCode;
    }

    if (role == this.environment.distRoleCode) this.isDist = true;
    else if (role == this.environment.engRoleCode) this.isEng = true;
    else if (role == this.environment.custRoleCode) this.isCust = true;

    this.buBrandModel = new BUBrandModel();
    this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId;
    this.buBrandModel.brandId = this.user.selectedBrandId;
    this.instrumentService.getAll(this.buBrandModel).pipe(first())
      .subscribe((data: any) => {
        debugger;
        this.instrumentList = data.data
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['instrument'], {
      queryParams: {
        isNSNav: false
      },
    });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`instrument/${data.id}`], {
      queryParams: {
        isNSNav: true
        //creatingNewDistributor: true
      },
    })
  }

  DataFilter(event) {
    this.instrumentList = event
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
        headerName: 'Serial No',
        field: 'serialNos',
        filter: true,
        sortable: true,
        tooltipField: 'serialNos'
      },
      {
        headerName: 'Business Unit',
        field: 'businessUnitName',
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
      {
        headerName: 'Manufacturer',
        field: 'manufName',
        filter: true,
        sortable: true,
        tooltipField: 'manufName'
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}

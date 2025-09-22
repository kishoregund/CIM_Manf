import { Component, OnInit } from '@angular/core';

import { User, Customer, Country, Instrument, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, AlertService, CountryService, NotificationService, ProfileService } from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { EnvService } from '../_services/env/env.service';
import { CustomerInstrumentService } from '../_services/customerinstrument.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { CustomerInstrument } from '../_models/customerinstrument';
import { BUBrandModel } from '../_newmodels/BUBrandModel';


@Component({
  selector: 'app-custinstuList',
  templateUrl: './customerinstrumentlist.html',
})
export class CustomerInstrumentListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  customerinstrumentList: CustomerInstrument[];
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

  isDist: boolean = false;
  isEng: boolean = false;
  isCust: boolean = false;

  buBrandModel: BUBrandModel;
  constructor(
    private router: Router,
    private accountService: AccountService,
    private profileService: ProfileService,
    private custInstrumentService: CustomerInstrumentService,
    private environment: EnvService
  ) {

  }

  ngOnInit() {
    let role = JSON.parse(sessionStorage.getItem('segments'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCINS");
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
      //temp added AddAccess for testing
      this.hasAddAccess = true;
      role = role[0]?.itemCode;
    }

    if (role == this.environment.distRoleCode) this.isDist = true;
    else if (role == this.environment.engRoleCode) this.isEng = true;
    else if (role == this.environment.custRoleCode) this.isCust = true;

    debugger;
    this.buBrandModel = new BUBrandModel();
    this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId; 
    this.buBrandModel.brandId = this.user.selectedBrandId; 
    this.custInstrumentService.getAll(this.buBrandModel).pipe(first())
      .subscribe((data: any) => {
        this.customerinstrumentList = data.data;
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['customerinstrument'], {
      queryParams: {
        isNSNav: false
      },
    });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`customerinstrument/${data.id}`], {
      queryParams: {
        isNSNav: true
        //creatingNewDistributor: true
      },
    })
  }

  DataFilter(event) {
    this.customerinstrumentList = event
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
        headerName: 'Site Name',
        field: 'custSiteName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'custSiteName'
      },
      {
        headerName: 'Instrument',
        field: 'instrumentSerNoType',
        filter: true,
        sortable: true,
        tooltipField: 'instrumentSerNoType'
      }
      //,
      // {
      //   headerName: 'Business Unit',
      //   field: 'businessUnit',
      //   filter: true,
      //   sortable: true,
      //   tooltipField: 'Business Unit'
      // },
      // {
      //   headerName: 'Brand',
      //   field: 'brand',
      //   filter: true,
      //   sortable: true,
      //   tooltipField: 'Brand'
      // }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}

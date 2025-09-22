import { Component, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { ProfileReadOnly, User } from "../_models";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService, ProfileService } from "../_services";
import { first } from "rxjs/operators";
import { DatePipe } from "@angular/common";
import { EnvService } from '../_services/env/env.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { SRRecommendedService } from '../_services/srrecommended.service';
import { BUBrandModel } from '../_newmodels/BUBrandModel';

@Component({
  selector: 'app-sparepartsrecommended',
  templateUrl: './sparepartsrecommended.component.html'
})

export class SparepartsrecommendedComponent implements OnInit {
  form: FormGroup;
  List: any;
  loading = false;
  submitted = false;
  isSave = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: UserDetails;
  showGrid: any = true;
  isDist: boolean;
  isCust: boolean;
  buBrandModel: BUBrandModel;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: SRRecommendedService,
    private profileService: ProfileService,
    private environment: EnvService,
    private route: ActivatedRoute

  ) {
  }

  ngOnInit() {

    let role = JSON.parse(sessionStorage.getItem('segments'));
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "SPRCM"
      );
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }
    else role = role[0]?.itemCode;
    if (role == this.environment.distRoleCode) this.isDist = true
    if (role == this.environment.custRoleCode) this.isCust = true

    this.buBrandModel = new BUBrandModel();
    this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId;
    this.buBrandModel.brandId = this.user.selectedBrandId;
    debugger;
    this.Service.getByGrid(this.buBrandModel).pipe(first())
      .subscribe((data: any) => { this.List = data.data; })
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(["localexpenses"],
      {
        queryParams: {
          isNSNav: false
        },
      });
  }

  DataFilter(event) {

    this.List = event;
    const datepipie = new DatePipe("en-US");

    this.List.forEach((value) => {
      value.assignedTofName = value.assignedToFName + " " + value.assignedToLName
      value.serviceReportDate = datepipie.transform(
        value.serviceReportDate,
        'dd/MM/YYYY'
      );
    })

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
        headerName: "Service Request No.",
        field: "serReqNo",
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true
      },
      {
        headerName: "Service Report Date",
        field: "serviceReportDate",
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: "Engineer Name",
        field: "assignedToFName",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Part No",
        field: "partNo",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Qty",
        field: "qtyRecommended",
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: "HSN Code",
        field: "hscCode",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
    ];
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }
}

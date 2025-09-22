import { Component, OnInit } from "@angular/core";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService, NotificationService, ProfileService } from "../_services";
import { CustspinventoryService } from "../_services/custspinventory.service";
import { RenderComponent } from "../distributor/rendercomponent";
import { Custspinventory } from "../_models/custspinventory";
import { first } from "rxjs/operators";
import { User } from "../_models";
import { EnvService } from "../_services/env/env.service";
import { UserDetails } from "../_newmodels/UserDetails";


@Component({
  selector: "app-Custspinventorylist",
  templateUrl: "./Custspinventorylist.component.html",
})

export class CustspinventorylistComponent implements OnInit {
  form: FormGroup;
  model: Custspinventory;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  user: UserDetails;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  profilePermission: any;
  showGrid: boolean;
  isDist: boolean;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: CustspinventoryService,
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
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "CTSPI");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = true;
    } else {
      role = role[0]?.itemCode;
    }

    if (role == this.environment.distRoleCode) this.isDist = true;
    else {
      this.toggleFilter();
      this.Service.getAll(this.user.contactId, this.user.entityParentId)
        .pipe(first())
        .subscribe((data: any) =>
          this.model = data.data
        );
    }

    this.columnDefs = this.createColumnDefs();
  }


  Add() {
    this.router.navigate(["customerspinventory"],
      {
        queryParams: {
          isNSNav: false
        },
      });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`customerspinventory/${data.id}`], {
      queryParams: {
        isNSNav: true//,
        //creatingNewDistributor: true
      },
    })
  }

  ShowData(event) {
    this.showGrid = event
  }

  DataFilter(event) {
    this.model = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }

  private createColumnDefs() {
    return [
      {
        headerName: "Instrument",
        field: "instrumentName",
        filter: true,
        tooltipField: "instrumentName",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Part No",
        field: "partNo",
        filter: true,
        tooltipField: "partNo",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "HSN Code",
        field: "hscCode",
        filter: true,
        tooltipField: "hsccode",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Qty. Available",
        field: "qtyAvailable",
        filter: true,
        tooltipField: "qtyAvailable",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Item Description",
        field: "sparePart.itemDesc",
        filter: true,
        tooltipField: "qtyAvailable",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  onGridReady(params: any): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();

  }
}

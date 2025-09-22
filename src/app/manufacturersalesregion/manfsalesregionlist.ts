import { Component, OnInit } from '@angular/core';

import { User, Country, ProfileReadOnly } from '../_models';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, ProfileService } from '../_services';
import { UserDetails } from '../_newmodels/UserDetails';
import { ManufacturerSalesRegion } from '../_models/manufacturerSalesRegion';
import { ManufacturerService } from '../_services/manufacturer.service';


@Component({
  selector: 'app-manfsalesregionList',
  templateUrl: './manfsalesregionlist.html',
})
export class ManufacturerSalesRegionListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  manfSalesRegionModel: ManufacturerSalesRegion[];
  loading = false;
  submitted = false;
  isSave = false;
  manufacturerId: string;
  type: string = "M";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  manufacturerName: any;

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private manufacturerService: ManufacturerService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SMANF");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }


    this.manufacturerId = this.route.snapshot.paramMap.get('id');
    this.manufacturerService.getById(this.manufacturerId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          debugger;
          this.manufacturerName = data.data?.manfName
          this.manfSalesRegionModel = data.data?.salesRegions || [];
        },
        error: () => {
          //this.alertService.error(error);

          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['manfsalesregion', this.manufacturerId], {
      queryParams: {
        isNSNav: false
      },
    });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`manfsalesregion/${this.manufacturerId}/${data.id}`], {
      queryParams: {
        isNSNav: true
        //creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Sales Region Name',
        field: 'salesRegionName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'salesRegionName',
      // }, {
      //   headerName: 'Pay Term',
      //   field: 'payTermsValue',
      //   filter: true,
      //   editable: false,
      //   sortable: true,
      //   tooltipField: 'payTermsValue',
      }
      // , {
      //   headerName: 'Manufacturer',
      //   field: 'manfName',
      //   filter: true,
      //   editable: false,
      //   sortable: true,
      //   tooltipField: 'manfName',
      // }

    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}

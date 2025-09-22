import { Component, OnInit } from '@angular/core';

import { User, Country, ProfileReadOnly } from '../_models';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi, ColumnApi } from 'ag-grid-community';

import { AccountService, NotificationService, ProfileService } from '../_services';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ManufacturerService } from '../_services/manufacturer.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { Manufacturer } from '../_models/manufacturer';


@Component({
  selector: 'app-manufacturerList',
  templateUrl: './manufacturerlist.html',
})
export class ManufacturerListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  manufacturerModel:Manufacturer[];
  loading = false;
  submitted = false;
  isSave = false;
  manufacturerId: string;
  type: string = "M";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  bsModalRef: BsModalRef;

  constructor(
    //private modalService: BsModalService,
    private router: Router,
    private accountService: AccountService,
    private manufacturerService: ManufacturerService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
  ) {
    // this.notificationService.listen().subscribe((m: any) => {
    //   this.manufacturerService.getAll()
    //     .pipe(first()).subscribe((data: any) => this.manufacturerModel = data.data);
    // })
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
    // this.hasAddAccess = this.profilePermission.permissions.filter(x => x.screenName == "Manufacturer")[0].create;
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    
    // this.manufacturerId = this.route.snapshot.paramMap.get('id');
    this.manufacturerService.getAll()
      .pipe(first()).subscribe((data: any)=> {
       debugger; 
        this.manufacturerModel = data.data
      });

      this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(['manufacturer'], {
      queryParams: {
        isNSNav: false
        //creatingNewManufacturer: true
      },
    });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`manufacturer/${data.id}`], {
      queryParams: {
        isNSNav: true
//        creatingNewManufacturer: true
      },
    })
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Manufacturer Name',
        field: 'manfName',
        filter: true,
        tooltipField: 'manfName',
        enableSorting: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Pay Term',
        field: 'paytermsName',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'paytermsName',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;

    this.api.sizeColumnsToFit();
  }

  // ImportData() {

  //   const config: any = {
  //     backdrop: 'static',
  //     keyboard: false,
  //     animated: true,
  //     ignoreBackdropClick: true,
  //   };
  //   this.bsModalRef = this.modalService.show(ImportManufacturerComponent, config);
  // }
}

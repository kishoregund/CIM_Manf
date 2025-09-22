import { Component, OnInit } from '@angular/core';

import { ListType, ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  AlertService,
  ListTypeService,
  MasterListService,
  NotificationService,
  ProfileService
} from '../_services';
//import { RenderComponent } from '../distributor/rendercomponent';
import { UserDetails } from '../_newmodels/UserDetails';


@Component({
  selector: 'app-masterList',
  templateUrl: './masterlist.html',
})
export class MasterListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  masterList: ListType[];
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

  constructor(
    private router: Router,
    private accountService: AccountService,
    private masterlistService: MasterListService,
    private profileService: ProfileService,
    private listTypeService: ListTypeService,
  ) {

  }

  ngOnInit() {
    //debugger;
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "MAST");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasUpdateAccess = true;
      this.hasReadAccess = true;
    }
    this.masterlistService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          // debugger;
          this.masterList = data.data;
          // data.data.forEach((value1) => {
          //   this.listTypeService.getByListId(value1.id)
          //     .pipe(first())
          //     .subscribe({
          //       next: (data1: any) => {

          //         data1.data.forEach((value) => {
          //           sessionStorage.setItem(value.listTypeId, JSON.stringify(data1.data));
          //         })

          //       }
          //     })
          // })
        },
        error: error => {

          this.loading = false;
        }
      });
    this.columnDefs = this.createColumnDefs();
  }


  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`masterlistitem/${data.id}`], {
      queryParams: {
        isNSNav: true
        //creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'List Name',
        field: 'listName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'listName',
      }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

}

import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { EnvService } from 'src/app/_services/env/env.service';
import { RenderComponent } from '../../distributor/rendercomponent';
import { Customersatisfactionsurvey, ProfileReadOnly, User } from '../../_models';
import {
  AccountService,
  ListTypeService,
  NotificationService,
  ProfileService
} from '../../_services';
import { UserDetails } from 'src/app/_newmodels/UserDetails';
import { CustomersatisfactionsurveyService } from 'src/app/_services/customersatisfactionsurvey.service';
import { DistributorService } from 'src/app/_services/distributor.service';

@Component({
  selector: 'app-customersatisfactionsurveylist',
  templateUrl: './customersatisfactionsurveylist.component.html',
})
export class CustomersatisfactionsurveylistComponent implements OnInit {
  form: FormGroup;
  List: any; //Customersatisfactionsurvey[];
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


  constructor(
    private router: Router,
    private accountService: AccountService,
    private Service: CustomersatisfactionsurveyService,
    private profileService: ProfileService,
    private distributorService: DistributorService,
    private listTypeService: ListTypeService,
    private environment: EnvService,
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(sessionStorage.getItem('segments'));

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "CTSS"
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
    } else {
      role = role[0]?.itemCode;
    }

    this.Service.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (!this.user.isAdmin) {
            this.distributorService.getByConId(this.user.contactId)
              .pipe(first())
              .subscribe({
                next: (data1: any) => {
                  if (role == this.environment.distRoleCode) {
                    if(data.data != null)
                      this.List = data.data.filter(x => x.distId == data1.data[0].id)
                    else
                      this.List = data.data;
                  } else if (role == this.environment.engRoleCode) {
                    if(data.data != null)
                      this.List = data.data.filter(x => x.engineerId == this.user.contactId)
                    else 
                      this.List = data.data;
                  } else {
                    this.List = data.data;
                  }
                }

              })
          } else {
            this.List = data.data
          }
        },
        error: (error) => {

          this.loading = false;
        },
      });

    this.columnDefs = this.createColumnDefs();
  }

  Add() {
    this.router.navigate(["/customersatisfactionsurvey"],
      {
        queryParams: {
          isNSNav: false
        },
      });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`customersatisfactionsurvey/${data.id}`], {
      queryParams: {
        isNSNav: true
        //creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [
      {
        headerName: "Engineer Name",
        field: "engineerName",
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: "name",
      },
      {
        headerName: "Service Request No",
        field: "serviceRequestNo",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "code",
      },
      {
        headerName: "Name",
        field: "name",
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: "Name",
      },


    ];
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }
}

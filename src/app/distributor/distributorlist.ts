import { Component, OnInit } from '@angular/core';

import { User, Distributor, Country, ProfileReadOnly } from '../_models';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, GridApi } from 'ag-grid-community';

import { AccountService, NotificationService, ProfileService } from '../_services';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ImportDistributorComponent } from './importdistributor.component';
import { DistributorService } from '../_services/distributor.service';
import { UserDetails } from '../_newmodels/UserDetails';


@Component({
    selector: 'app-distributorList',
    templateUrl: './distributorlist.html',
    standalone: false
})
export class DistributorListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  distributorModel: Distributor[];
  loading = false;
  submitted = false;
  isSave = false;
  distributorId: string;
  type: string = "D";
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  
  private api: GridApi;
  bsModalRef: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private accountService: AccountService,
    private distributorService: DistributorService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      this.distributorService.getAll()
        .pipe(first()).subscribe((data: any) => this.distributorModel = data.data);
    })
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SDIST");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    // this.hasAddAccess = this.profilePermission.permissions.filter(x => x.screenName == "Distributor")[0].create;
    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
    }
    this.columnDefs = this.createColumnDefs();
    // this.distributorId = this.route.snapshot.paramMap.get('id');
    this.loading = true;
    this.distributorService.getAll()
      .pipe(first()).subscribe({
        next: (data: any) => {
          this.distributorModel = data.data;
          if (!this.user.isManfSubscribed && this.distributorModel.length > 0) {
            this.hasAddAccess = false;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading distributor data:', error);
          this.distributorModel = [];
          this.loading = false;
        }
      });
  }

  Add() {
    this.router.navigate(['distributor'], {
      queryParams: {
        isNSNav: false,
        creatingNewDistributor: true
      },
    });
  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`distributor/${data.id}`], {
      queryParams: {
        isNSNav: true
        //        creatingNewDistributor: true
      },
    })
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Distributor Name',
        field: 'distName',
        filter: true,
        tooltipField: 'distName',
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
    

    this.api.sizeColumnsToFit();
  }

  ImportData() {

    const config: any = {
      backdrop: 'static',
      keyboard: false,
      animated: true,
      ignoreBackdropClick: true,
    };
    this.bsModalRef = this.modalService.show(ImportDistributorComponent, config);
  }
}

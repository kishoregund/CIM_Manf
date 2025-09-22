import { Component, OnInit } from '@angular/core';

import { Country, ProfileReadOnly, ServiceRequest, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { environment } from '../../environments/environment';
import {
  AccountService,
  ListTypeService,
  NotificationService,
  ProfileService,
} from '../_services';
import { RenderComponent } from '../distributor/rendercomponent';
import { DatePipe } from '@angular/common';
import { ServiceRComponent } from './ServicerequestRenderer';
import { EnvService } from '../_services/env/env.service';
import { GetParsedDate } from '../_helpers/Providers';
import { ContactService } from '../_services/contact.service';
import { ServiceRequestService } from '../_services/serviceRequest.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { BUBrandModel } from '../_newmodels/BUBrandModel';


@Component({
  selector: 'app-distributorRgList',
  templateUrl: './serviceRequestlist.html',
})
export class ServiceRequestListComponent implements OnInit {
  user: UserDetails;
  form: FormGroup;
  srCustList: ServiceRequest[];
  srDistList: ServiceRequest[];
  srAdminList: ServiceRequest[];
  srEngList: ServiceRequest[];
  loading = false;
  customerId: string;
  countries: Country[];
  profilePermission: ProfileReadOnly;
  hasAddAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  IsCustomerView: boolean = true;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  IsAdminView: boolean = false;
  distId: any;
  datepipe: any = new DatePipe("en-US");
  appendList: any;
  showGrid: boolean = true;
  buBrandModel : BUBrandModel;
 
  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private contactService: ContactService,
    private serviceRequestService: ServiceRequestService,
    private listTypeService: ListTypeService,
    private environment: EnvService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREQ");
      if (profilePermission.length > 0) {
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
      }
    }
    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = true;
      this.IsAdminView = true;
      this.GetAllRecord();
      this.columnDefs = this.createCustColumnDefs();
    } 
    else {
      //this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();

      let role = JSON.parse(sessionStorage.getItem('segments'));
      role = role[0]?.itemCode;

      if (role == this.environment.custRoleCode) {
        this.IsCustomerView = true;
        this.IsDistributorView = false;
        this.IsEngineerView = false;
      } else if (role == this.environment.distRoleCode) {
        this.IsCustomerView = false;
        this.IsDistributorView = true;
        this.IsEngineerView = false;
      } else {
        this.IsCustomerView = false;
        this.IsDistributorView = false;
        this.IsEngineerView = true;
      }

      // this.contactService.getDistByContact(this.user.contactId)
      //   .pipe(first())
      //   .subscribe({
      //     next: (data: any) => {
      //       this.distId = data.data.defdistid;
            this.GetAllRecord();
        //   },
        // });

      // this.distributorId = this.route.snapshot.paramMap.get('id');

      if (this.IsDistributorView) {
        this.columnDefs = this.createDisColumnDefs();
      } else if (this.IsEngineerView) {
        this.columnDefs = this.createDisColumnDefs();
      } else if (this.IsCustomerView) {
        this.columnDefs = this.createCustColumnDefs();
      } else if (this.IsAdminView) {
        this.columnDefs = this.createDisColumnDefs()
      }
    }
    //[KG] - commented
    // setTimeout(() => {
    //   setInterval(() => {
    //     var nodes = []
    //     for (let i = 0; i < this.api?.getDisplayedRowCount(); i++) {
    //       var col = this.api.getDisplayedRowAtIndex(i)
    //       if (col.data.isCritical) {
    //         nodes.push(col)
    //       }
    //     }
    //     this.api.flashCells({ rowNodes: nodes, columns: ["serReqNo"] })
    //   }, 2000)
    // }, 100);

    if (!this.IsDistributorView) {
      this.toggleFilter()
    }

  }

  EditRecord() {
    var data = this.api.getSelectedRows()[0]
    this.router.navigate([`servicerequest/${data.id}`], {
      queryParams: {
        isNSNav: true
        //creatingNewDistributor: true
      },
    })
  }

  GetAllRecord() {
    this.buBrandModel = new BUBrandModel();
    this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId; 
    this.buBrandModel.brandId = this.user.selectedBrandId; 
    this.serviceRequestService.getAll(this.buBrandModel)
      .pipe(first())
      .subscribe((data: any) => {
        //data.data = data.data.filter(x => !x.isReportGenerated)
        this.getAllSRRecords(data.data)
      })
  }

  Add() {
    this.router.navigate(['servicerequest'],
      {
        queryParams: {
          isNSNav: false
        },
      });
  }

  ShowData(event) {
    this.showGrid = event
  }

  toggleFilter() {
    this.showGrid = !this.showGrid
  }


  private createDisColumnDefs() {
    return [
      {
        headerName: 'Service Request No.',
        field: 'serReqNo',
        filter: true,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: '/servicerequest',
        },
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'Service Request No.',
      },
       {
        headerName: 'Site Name',
        field: 'siteName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Machine Serial No.',
        field: 'machinesModelName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Machine Model Name',
        field: 'machmodelName',
        filter: true,
        editable: false,
        sortable: true
      },
      // {
      //   headerName: 'Contact Person',
      //   field: 'contactperson',
      //   filter: true,
      //   editable: false,
      //   sortable: true
      // },
      {
        headerName: 'Service Type',
        field: 'visitTypeName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Status',
        field: 'statusName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Stage',
        field: 'stageName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Raised On',
        field: 'createdOn',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Eng. Comments',
        field: 'engComments',
        filter: true,
        hide: !this.IsDistributorView,
        editable: false,
        sortable: true,
        tooltipField: 'engComments',
      },
      {
        headerName: 'Assigned To',
        field: 'assignedToName',
        width: 400,
        // cellRendererFramework: ServiceRComponent,
        hide: !this.IsDistributorView,
        // cellRendererParams: {
        //   isDist: this.IsDistributorView
        // },
        filter: true,
        editable: false,
        sortable: true
      }]
  }

  private createCustColumnDefs() {
    return [
      {
        headerName: 'Service Request No.',
        field: 'serReqNo',
        filter: true,
        enableSorting: true,
        cellRendererFramework: RenderComponent,
        cellRendererParams: {
          inRouterLink: '/servicerequest',
        },
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Distributor Name',
        field: 'distributor',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: 'Site Name',
        field: 'siteName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Machine Serial No.',
        field: 'machinesModelName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Machine Model Name',
        field: 'machmodelName',
        filter: true,
        editable: false,
        sortable: true
      },
      // {
      //   headerName: 'Contact Person',
      //   field: 'contactperson',
      //   filter: true,
      //   editable: false,
      //   sortable: true
      // },
      {
        headerName: 'Service Type',
        field: 'visitTypeName',
        filter: true,
        editable: false,
        sortable: true
      },
      {
        headerName: 'Schedule Details',
        field: 'scheduledCalls.Time',
        filter: true,
        width: 350,
        editable: false,
        sortable: true
      }
    ]
  }


  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  getAllSRRecords(data) {
    debugger;
    if (!this.IsDistributorView) this.showGrid = true;
    //data = data.filter(x => !x.isReportGenerated);
    data?.forEach(ser => {
      ser.accepted ? ser.accepted = "Accepted" : ser.accepted = "Not Accepted"
      ser.createdOn = this.datepipe.transform(GetParsedDate(ser.createdOn), "MM/dd/yyyy HH:mm")
      if (ser.scheduledCalls.length > 0) {
        ser.scheduledCalls = ser.scheduledCalls[0]
        let date = new Date(ser.scheduledCalls.endTime)
        let datestr = this.datepipe.transform(GetParsedDate(date), 'dd/MM/YYYY')
        ser.scheduledCalls.endTime = this.datepipe.transform(GetParsedDate(ser.scheduledCalls.endTime), "shortTime")
        ser.scheduledCalls.startTime = this.datepipe.transform(GetParsedDate(ser.scheduledCalls.startTime), "shortTime")
        ser.scheduledCalls.Time = ser.scheduledCalls.location + " : " + datestr + " At " + ser.scheduledCalls.startTime + " - " + ser.scheduledCalls.endTime
      }
      if (ser.engComments?.length > 0) {
        let date = this.datepipe.transform(GetParsedDate(ser.engComments[0]?.nextDate), 'dd/MM/YYYY')
        ser.engComments = date + " : " + ser.engComments[0].comments
      }
    });

    if (!this.user.isAdmin) {
      this.srCustList = data;
      this.srDistList = data;
      this.srEngList = data;
    }
    else this.srAdminList = data;
  }

}
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Component, OnInit } from '@angular/core';
import {
  actionList,
  Contact,
  Country,
  Customer,
  CustomerSite,
  Distributor,
  EngineerCommentList,
  FileShare,
  Instrument,
  ListTypeItem,
  ProfileReadOnly,
  ResultMsg,
  ServiceReport,
  ServiceRequest,
  ticketsAssignedHistory,
  User
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModelEngContentComponent } from './modelengcontent';
import { ModelEngActionContentComponent } from './modelengactioncontent';
import { DatePipe } from '@angular/common';

import {
  AccountService,
  AlertService,
  CountryService,
  CurrencyService,
  FileshareService,
  ListTypeService,
  NotificationService,
  ProfileService,
  UploadService
} from '../_services';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FilerendercomponentComponent } from '../offerrequest/filerendercomponent.component';
import { EnvService } from '../_services/env/env.service';
import { GetParsedDate } from '../_helpers/Providers';
import { UserDetails } from '../_newmodels/UserDetails';
import { EngActionService } from '../_services/engaction.service';
import { CustomerService } from '../_services/customer.service';
import { DistributorService } from '../_services/distributor.service';
import { EngSchedulerService } from '../_services/engscheduler.service';
import { EngCommentService } from '../_services/engcomment.service';
import { InstrumentService } from '../_services/instrument.service';
import { ServiceRequestService } from '../_services/serviceRequest.service';
import { ServiceReportService } from '../_services/serviceReport.service';
import { SRAssignedHistoryService } from '../_services/srassignedhistory.service';
import { CustomerSiteService } from '../_services/customersite.service';
import { CustomerInstrumentService } from '../_services/customerinstrument.service';
import { BUBrandModel } from '../_newmodels/BUBrandModel';


@Component({
  selector: 'app-customer',
  templateUrl: './serviceRequest.html',
})

export class ServiceRequestComponent implements OnInit {
  user: UserDetails;
  serviceRequestform: FormGroup;
  submitted = false;
  serviceRequestId: string;
  pdfPath: any;
  countries: Country[];
  defaultdistributors: Distributor[];
  serviceRequest: ServiceRequest;
  srAssignedHistory: ticketsAssignedHistory;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  appendList: Contact[];
  public columnDefs: any[];
  public ticketcolumnDefs: any[];
  public actionDefs: any[];
  private columnApi: ColumnApi;
  private api: GridApi;
  PdffileData: FileShare[];
  pdfBase64: string;
  public pdfcolumnDefs: any[];
  private pdfcolumnApi: ColumnApi;
  private pdfapi: GridApi;
  private historycolumnApi: ColumnApi;
  private historyapi: GridApi;
  customerList: Customer[];
  engineerCommentList: EngineerCommentList[] = [];
  engcomment: EngineerCommentList;
  ticketHistoryList: ticketsAssignedHistory[] = [];
  actionList: actionList[] = [];
  customerSitelist: CustomerSite[] = [];
  customerlist: any = [];
  customer: any = [];
  serviceTypeList: ListTypeItem[];
  subreqtypelist: ListTypeItem[];
  reqtypelist: ListTypeItem[];
  instrumentList: Instrument[];
  siteUsers: any =[];
  IsCustomerView: boolean = true;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  logindata: any;
  customerId: any;
  siteId: any;
  distId: any;
  siteUserId: any;
  bsModalRef: BsModalRef;
  bsActionModalRef: BsModalRef;
  engineername: string;
  engineerid: string;
  servicereport: ServiceReport;
  dropdownSettings: IDropdownSettings = {};
  custcityname: string;
  breakdownlist: ListTypeItem[];
  allsites: any;
  accepted: boolean = false;
  isAmc: boolean = false;
  scheduleLink: string;
  transaction: number;
  hastransaction: boolean;
  file: any;
  role: any;
  instrumentStatus: ListTypeItem[];
  stagelist: ListTypeItem[];
  statuslist: ListTypeItem[];
  scheduleData: any;
  scheduleDefs: any[];
  hasCallScheduled: boolean;
  isGenerateReport: boolean = false;
  isNewMode: boolean;
  isEditMode: boolean;
  designationList: ListTypeItem[];
  datepipe = new DatePipe('en-US')
  lockRequest: boolean;
  formData: any;

  SRCreated: boolean = false;
  SRAssigned: boolean = false;
  SRMeetingScheduled: boolean = false;
  SRInProgress: boolean = false;
  SREngSigned: boolean = false;
  SRCustSigned: boolean = false;
  SRCompleted: boolean = false;

  lstCurrency: any[] = [];
  baseCurrId: any;
  isNotUnderAmc: any;
  buBrandModel: BUBrandModel;
  emptyGuid = '00000000-0000-0000-0000-000000000000';
  constructor(
    private accountService: AccountService,
    private actionservice: EngActionService,
    private alertService: AlertService,
    private customerSiteService: CustomerSiteService,
    private countryService: CountryService,
    private customerService: CustomerService,
    private distributorService: DistributorService,
    private EngschedulerService: EngSchedulerService,
    private engcomservice: EngCommentService,
    private environment: EnvService,
    private fileshareService: FileshareService,
    private formBuilder: FormBuilder,
    private customerInstrumentService: CustomerInstrumentService,
    private listTypeService: ListTypeService,
    private modalService: BsModalService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private serviceRequestService: ServiceRequestService,
    private servicereportService: ServiceReportService,
    private srAssignedHistoryService: SRAssignedHistoryService,
    private uploadService: UploadService,
    private currencyService: CurrencyService,
    private instrumentService: InstrumentService
  ) {
    this.notificationService.listen().subscribe((m: any) => {
      if (this.serviceRequestId != null) {
        this.serviceRequestService.getById(this.serviceRequestId).pipe(first())
          .subscribe({
            next: (data: any) => {
              debugger;
              this.engineerCommentList = data.data.engComments;
              this.engineerCommentList.forEach((value, index) => {
                value.nextDate = this.datepipe.transform(GetParsedDate(value.nextDate), "dd/MM/YYYY")
              });
              this.actionList = data.data.engAction;
              this.actionList.forEach((value, index) => {
                value.actionDate = this.datepipe.transform(GetParsedDate(value.actionDate), "dd/MM/YYYY")
              })
              //this.api.refreshCells()
            }
          });
        // this.EngschedulerService.getByEngId(this.user.contactId).pipe(first())
        //   .subscribe((data: any) => {
        //     data.data.filter(x => x.serReqId == this.serviceRequestId).length > 0 ? this.hasCallScheduled = true : this.hasCallScheduled = false;
        //   });
      }
    })
  }

  async ngOnInit(isReset = false) {

    this.transaction = 0;
    this.user = this.accountService.userValue;
    this.serviceRequestId = this.route.snapshot.paramMap.get('id');
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREQ");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
      this.hasUpdateAccess = false;
      this.hasReadAccess = false;
      this.notificationService.RestrictAdmin()
      return;
    }
    else {
      let role = JSON.parse(sessionStorage.getItem('segments'));
      this.role = role[0]?.itemCode;
    }

    let role = this.role;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();

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

    this.serviceRequestform = this.formBuilder.group({
      sDate: [""],
      eDate: [""],
      serReqNo: ['', Validators.required],
      distId: ['', Validators.required],
      custId:  this.emptyGuid,
      statusId: this.emptyGuid,
      stageId: this.emptyGuid,
      siteId: this.emptyGuid,
      assignedTo: this.emptyGuid,
      serReqDate: ['', Validators.required],
      visitType: ['', Validators.required],
      companyName: [''],
      requestTime: ['', Validators.required],
      siteName: [''],
      country: ['', Validators.required],
      contactPerson: [''],
      email: [''],
      operatorName: [''],
      operatorNumber: [''],
      operatorEmail: [''],
      machModelName: [''],
      machinesNo: ['', Validators.required],
      machEngineer: [''],
      xrayGenerator: [''],
      breakdownType: ['', Validators.required],
      isRecurring: [false],
      recurringComments: [''],
      breakoccurDetailsId: ['', Validators.required],
      alarmDetails: [''],
      resolveAction: [''],
      currentInstruStatus: ['', Validators.required],
      accepted: [{ value: false, disabled: this.accepted }],
      serResolutionDate: [''],
      escalation: [''],
      requestTypeId: [''],
      subRequestTypeId: ["", Validators.required],
      remarks: [''],
      delayedReasons: [''],
      isActive: [true],
      isDeleted: [false],
      isCritical: [false],

      totalCost: [],
      totalCostUSD: [],
      baseAmt: [1.00],
      baseCurrency: [],
      totalCostCurrency: [],
      amcServiceQuote: [],
      siteUserId: this.emptyGuid,

      engComments: this.formBuilder.group({
        nextDate: [''],
        comments: ['']
      }),

      assignedHistory: this.formBuilder.group({
        engineerName: [''],
        assignedDate: [''],
        ticketStatus: [''],
        comments: ['']
      }),

      engAction: this.formBuilder.group({
        engineerName: [''],
        actionTaken: [''],
        comments: [''],
        teamviewerRecording: [''],
        actionDate: ['']
      })
    });

    this.customerService.getAll().pipe(first())
      .subscribe((data: any) => {
        debugger;
        this.customerlist = data.data;
      });

    this.currencyService.getAll()
      .pipe(first()).subscribe((data: any) => {
        this.lstCurrency = data.data
        this.baseCurrId = data.data.find(x => x.code == this.environment.baseCurrencyCode)?.id
        this.serviceRequestform.get("baseCurrency").setValue(this.baseCurrId)
      })

    setTimeout(() => {
      this.serviceRequestform.get('baseAmt').setValue(1.00)
      this.serviceRequestform.get('baseAmt').disable()
    }, 500);


    this.dropdownSettings = {
      idField: 'itemCode',
      textField: 'itemName',
    };

    this.listTypeService.getById('SRT').pipe(first())
      .subscribe((data: any) => this.subreqtypelist = data.data);

    this.serviceRequestform.get('totalCostCurrency').valueChanges
      .subscribe(value => {
        if (!this.isEditMode) return;
        if (value == this.serviceRequestform.get('baseCurrency').value) {
          this.serviceRequestform.get('baseAmt').setValue(1.00)
          this.serviceRequestform.get('baseAmt').disable()
          this.serviceRequestform.get('baseCurrency').disable()
        }
        else {
          this.serviceRequestform.get('baseAmt').enable()
          this.serviceRequestform.get('baseCurrency').enable()
        }
      });

    this.serviceRequestform.get('totalCost').valueChanges
      .subscribe(value => {
        let costUSD = (this.serviceRequestform.get('baseAmt').value * this.serviceRequestform.get('totalCost').value);
        if (costUSD != null && costUSD != undefined) {
          this.serviceRequestform.get('totalCostUSD').setValue(costUSD.toFixed(2))
        }
      });

    this.serviceRequestform.get('baseAmt').valueChanges
      .subscribe(value => {
        let costUSD = (this.serviceRequestform.get('baseAmt').value * this.serviceRequestform.get('totalCost').value);
        if (costUSD != null && costUSD != undefined) {
          this.serviceRequestform.get('totalCostUSD').setValue(costUSD.toFixed(2))
        }
      });

    this.serviceRequestform.get("serResolutionDate").valueChanges
      .subscribe((data: any) => {
        if (!data) return;
        if (data < GetParsedDate(this.serviceRequestform.get("serReqDate").value)) {
          this.notificationService.showError("The Resolution Date should be after Service Request Date", "Invalid Date")
        }
      });

    this.serviceRequestform.get("amcServiceQuote").valueChanges
      .subscribe((data: any) => {
        debugger;
        if (this.isEditMode && !this.IsEngineerView) {
          if (data) {
            this.serviceRequestform.get("assignedTo").enable();
          }
          else {
            this.serviceRequestform.get("assignedTo").disable();
            this.serviceRequestform.get("assignedTo").setValue("");
          }
        }
      });

    if (this.IsEngineerView == true) {
      // this.serviceRequestform.get('requesttypeid').setValidators([Validators.required]);
      // this.serviceRequestform.get('requesttypeid').updateValueAndValidity();
      this.serviceRequestform.get('subRequestTypeId').setValidators([Validators.required]);
      this.serviceRequestform.get('subRequestTypeId').updateValueAndValidity();

      this.EngschedulerService.getByEngId(this.user.contactId).pipe(first())
        .subscribe((data: any) => {
          data.data.filter(x => x.serReqId == this.serviceRequestId).length > 0 ? this.hasCallScheduled = true : this.hasCallScheduled = false;
        })
    }

    this.countryService.getAll().pipe(first())
      .subscribe((data: any) => this.countries = data.data);

    this.listTypeService.getById('SERTY').pipe(first())
      .subscribe({
        next: (data: any) => {
          this.serviceTypeList = data.data;
          console.log(data);

          if (this.IsCustomerView) {
            this.serviceTypeList = this.serviceTypeList.filter(x => x.itemCode != "AMC" && x.itemCode != "RENEW" && x.itemCode != "PLAN")
          }
        }
      });

    this.listTypeService.getById('DESIG').pipe(first())
      .subscribe({
        next: (data: any) => {
          this.designationList = data.data.filter(x => x.isEscalationSupervisor)
        }
      });

    this.listTypeService.getById('SRSAT').pipe(first())
      .subscribe({
        next: (data: any) => {
          this.stagelist = data.data;
          if (this.serviceRequestId == null) {
            this.serviceRequestform.get('stageId').setValue(data.data.find(x => x.itemCode == "NTSTD")?.listTypeItemId);
          }
        },
      });

    this.listTypeService.getById('SRQST')
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.statuslist = data.data;
          if (this.serviceRequestId == null) {
            this.serviceRequestform.get('statusId').setValue(data.data.find(x => x.itemCode == "NTACP")?.listTypeItemId);
            if (this.IsCustomerView)
              this.serviceRequestform.get('statusId').setValue(data.data.find(x => x.itemCode == "NTASS")?.listTypeItemId);
          }
          if (this.IsEngineerView) {
            this.statuslist = this.statuslist.filter(x => x.itemCode != "NTASS" && x.itemCode != "ASSGN")
            this.serviceRequestform.get('statusId').setValue(this.statuslist.find(x => x.itemCode == "NTACP")?.listTypeItemId);
          }
        }
      });

    this.listTypeService.getById('CINSS').pipe(first())
      .subscribe((data: any) => this.instrumentStatus = data.data);

    this.listTypeService.getById("BDOD").pipe(first())
      .subscribe((data: any) => this.breakdownlist = data.data);

    this.listTypeService.getById("TRRQT").pipe(first())
      .subscribe((data: any) => {
        this.reqtypelist = data.data;
        // if (this.IsCustomerView)
        // this.serviceRequestform.get('requesttypeid').setValue(data.find(x => x.itemCode == 'CUSTR')?.listTypeItemId);
      });

    this.distributorService.getAll().pipe(first())
      .subscribe({
        next: (data: any) => this.defaultdistributors = data.data
      });

    this.scheduleLink = `/schedule/${this.serviceRequestId}`;
    this.ticketcolumnDefs = this.createColumnHistoryDefs();
    this.scheduleDefs = this.createColumnScheduleDefs();

    if (this.serviceRequestId != null) {
      this.serviceRequestService.getById(this.serviceRequestId)
        .subscribe({
          next: (data: any) => {
            debugger;
            setTimeout(() => {
              this.customerId = data.data.custId;
              this.onCustomerChanged();
              this.onSiteChanged(data.data.siteId);
              this.onMachineNoChanged(data.data.machinesNo)
            }, 200);

            this.isNotUnderAmc = data.data.isNotUnderAmc;
            this.lockRequest = data.data.lockRequest;

            if (this.isNotUnderAmc && this.IsDistributorView) {
              this.f.amcServiceQuote.setValidators([Validators.required])
              this.f.totalCostCurrency.setValidators([Validators.required])
              this.f.totalCost.setValidators([Validators.required])

              this.f.amcServiceQuote.updateValueAndValidity()
              this.f.totalCostCurrency.updateValueAndValidity()
              this.f.totalCost.updateValueAndValidity()
            }
            this.SRCreated = data.data.srStages.created;
            this.SRAssigned = data.data.srStages.assigned;
            this.SRMeetingScheduled = data.data.srStages.meetingScheduled;
            this.SRInProgress = data.data.srStages.inProgress;
            this.SREngSigned = data.data.srStages.engSigned;
            this.SRCustSigned = data.data.srStages.custSigned;
            this.SRCompleted = data.data.srStages.completed;
            this.siteUserId = data.data.siteUserId;

            this.onServiceTypeChange(data.data.visitType);
            var subreq = data.data.subRequestTypeId.split(',');
            let items: ListTypeItem[] = [];

            if (subreq.length > 0) {
              for (var i = 0; i < subreq.length; i++) {
                let t = new ListTypeItem();
                t.itemCode = subreq[i];
                if (this.subreqtypelist != undefined && this.subreqtypelist.length > 0) {
                  t.itemName = this.subreqtypelist.filter(x => x.itemCode == subreq[i])[0].itemName;
                }
                items.push(t);
              }

              this.serviceRequestform.patchValue({ "subRequestTypeId": items });
              this.fileshareService.list(this.serviceRequestId).pipe(first())
                .subscribe({
                  next: (data: any) => this.PdffileData = data.data
                });
            }

            this.listTypeService.getById('SRQST')
              .pipe(first()).subscribe({
                next: (status: any) => {
                  if (this.IsEngineerView && status.data.find(x => x.listTypeItemId == data.data.statusid)?.itemCode == "ASSGN") {
                    let notAcpted = status.data.find(x => x.itemCode == "NTACP")?.listTypeItemId
                    this.serviceRequestform.patchValue({ "statusId": notAcpted });
                  }
                }
              });

            this.distributorService.getDistributorRegionContacts(data.data.distId, "Engineer")
              .subscribe({
                next: (engData: any) => {
                  this.appendList = engData.data;
                  this.accepted = this.statuslist.find(x => x.itemCode == "ACPTD")?.listTypeItemId == data.data.statusId;
                  this.customerId = data.data.custId;
                  this.siteId = data.data.siteId;
                  this.engineerCommentList = data.data.engComments
                  let datepipe = new DatePipe("en-US");
                  this.engineerCommentList.forEach((value) => value.nextDate = datepipe.transform(GetParsedDate(value.nextDate), "dd/MM/YYYY"));
                  this.actionList = data.data.engAction;
                  this.actionList.forEach((value) => value.actionDate = datepipe.transform(GetParsedDate(value.actionDate), "dd/MM/YYYY"));
                  this.engineerid = data.data.assignedTo;
                  this.ticketHistoryList = data.data.assignedHistory;
                  this.ticketHistoryList.forEach((value) => value.assignedDate = datepipe.transform(GetParsedDate(value.assignedDate), "dd/MM/YYYY"))
                }
              });

            this.scheduleData = []
            if (!this.IsCustomerView) {
              setTimeout(() => {
                if (data.data.assignedTo != null && data.data.assignedTo != "") {
                  this.EngschedulerService.getByEngId(data.data.assignedTo)
                    .pipe(first()).subscribe((sch: any) => {
                      this.scheduleData = sch.data.filter(x => x.serReqId == this.serviceRequestId);
                      if (this.scheduleData.length > 0) this.hasCallScheduled = true;

                      this.scheduleData.forEach(element => {
                        element.endTime = this.datepipe.transform(GetParsedDate(element.endTime), "short")
                        element.startTime = this.datepipe.transform(GetParsedDate(element.startTime), "short")
                        element.Time = element.location + " : " + element.startTime + " - " + element.endTime
                      });

                    })
                }
              }, 2000);
            }

            //setTimeout(() => {                
            // this.serviceRequestform.patchValue({ "sdate": data.data.sdate });
            // this.serviceRequestform.patchValue({ "edate": data.data.edate });
            // this.serviceRequestform.patchValue({ "serreqno": data.data.serreqno });                
            // this.serviceRequestform.patchValue({ "distid": data.data.distid });
            // this.serviceRequestform.patchValue({ "custId": data.data.custId });
            // this.serviceRequestform.patchValue({ "visittype": data.data.visittype });
            // this.serviceRequestform.patchValue({ "companyname": data.data.companyname });
            // this.serviceRequestform.patchValue({ "requesttime": data.data.requesttime });
            // this.serviceRequestform.patchValue({ "siteName": data.data.sitename });
            // this.serviceRequestform.patchValue({ "country": data.data.country });
            // this.serviceRequestform.patchValue({ "contactperson": data.data.contactperson });
            // this.serviceRequestform.patchValue({ "email": data.data.email });
            // this.serviceRequestform.patchValue({ "operatorname": data.data.operatorname });
            // this.serviceRequestform.patchValue({ "operatornumber": data.data.operatornumber });
            // this.serviceRequestform.patchValue({ "operatoremail": data.data.operatoremail });
            // this.serviceRequestform.patchValue({ "siteId": data.data.siteId });                                
            // this.serviceRequestform.patchValue({ "machengineer": data.data.machengineer });
            // this.serviceRequestform.patchValue({ "xraygenerator": data.data.xraygenerator });
            // this.serviceRequestform.patchValue({ "breakdownType": data.data.breakdownType });
            // this.serviceRequestform.patchValue({ "isRecurring": data.data.isRecurring });
            // this.serviceRequestform.patchValue({ "recurringcomments": data.data.recurringcomments });
            // this.serviceRequestform.patchValue({ "breakoccurDetailsId": data.data.breakoccurDetailsId });
            // this.serviceRequestform.patchValue({ "alarmDetails": data.data.alarmDetails });
            // this.serviceRequestform.patchValue({ "resolveaction": data.data.resolveaction });
            // this.serviceRequestform.patchValue({ "currentinstrustatus": data.data.currentinstrustatus });                 
            // this.serviceRequestform.patchValue({ "escalation": data.data.escalation });
            // this.serviceRequestform.patchValue({ "requesttypeid": data.data.requesttypeid });
            // this.serviceRequestform.patchValue({ "remarks": data.data.remarks });                
            // this.serviceRequestform.patchValue({ "delayedReasons": data.data.delayedReasons });
            // this.serviceRequestform.get("assignedTo").setValue(data.data.assignedTo);
            ////below neeeded
            this.serviceRequestform.patchValue({ "serReqDate": this.datepipe.transform(GetParsedDate(data.data.serReqDate), 'dd/MM/YYYY') });
            this.serviceRequestform.patchValue({ 'serResolutionDate': GetParsedDate(data.data.serResolutionDate) });
            this.serviceRequestform.patchValue({ "machModelName": data.data.machmodelNameText });
            this.serviceRequestform.patchValue({ "stageId": data.data.stageId });
            this.serviceRequestform.patchValue({ "statusId": data.data.statusId });
            this.serviceRequestform.patchValue({ "totalCost": data.data.totalCost });
            this.serviceRequestform.patchValue({ "baseAmt": data.data.baseAmt });
            this.serviceRequestform.patchValue({ "baseCurrency": data.data.baseCurrency });
            this.serviceRequestform.patchValue({ "totalCostCurrency": data.data.totalCostCurrency });
            this.serviceRequestform.patchValue({ "amcServiceQuote": data.data.amcServiceQuote });
            

            this.formData = data.data;
            this.serviceRequestform.patchValue(this.formData);

            if (data.data.isReportGenerated) {
              this.serviceRequestform.disable()
              this.isGenerateReport = true;
            }            
            //}, 100);
          },

        });

      setTimeout(() => {
        this.serviceRequestform.disable();
        this.columnDefs = this.createColumnDefsRO();
        this.actionDefs = this.createColumnActionDefsRO();
        this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();

      }, 100);

    }
    else {

      // this.customerService.getAll().pipe(first())
      //   .subscribe((custData: any) => this.customerlist = custData.data)
      this.serviceRequestService.getSerReqNo()
        .pipe(first()).subscribe((data: any) => this.serviceRequestform.patchValue({ "serReqNo": data.data }));
      this.serviceRequestform.get('requestTime').setValue(this.datepipe.transform(Date.now(), "H:mm"))
      this.serviceRequestform.get('serReqDate').setValue(this.datepipe.transform(Date.now(), 'dd/MM/YYYY'))

      this.customerService.getAllByUserId(this.user.userId)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.SetCustomerData(data.data)
            this.distributorService.getDistributorRegionContacts(this.distId, "blank")
              .pipe(first()).subscribe((data: any) => this.appendList = data.data);

            if (this.IsDistributorView) {
              this.distributorService.getByConId(this.user.contactId).pipe(first())
                .subscribe({
                  next: (data: any) => {
                    if (!this.user.isAdmin) {
                      this.serviceRequestform.get('distId').setValue(data.data[0].id)
                      this.distId = data.data[0].id
                    }
                  }
                })
            }
          },
        });

      if (!isReset) {
        this.isNewMode = true
        this.FormControlDisable();
        this.columnDefs = this.createColumnDefs();
        this.actionDefs = this.createColumnActionDefs();
        this.pdfcolumnDefs = this.pdfcreateColumnDefs();
      }
      else {
        this.serviceRequestform.disable();
        this.columnDefs = this.createColumnDefsRO();
        this.actionDefs = this.createColumnActionDefsRO();
        this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();
        this.serviceRequestform.disable();
      }

      setTimeout(() => {
        this.serviceRequestform.get('baseAmt').disable()
      }, 500);

    }

    if (this.user.contactType == "CS") {
      this.serviceRequestform.get('siteId').disable();
    }
  }

  EditMode() {
    if (confirm("Are you sure you want to edit the record?")) {
      this.isEditMode = true;

      this.router.navigate(
        ["."],
        {
          relativeTo: this.route,
          queryParams: {
            isNSNav: false
          },
          queryParamsHandling: 'merge',
        });

      this.serviceRequestform.enable();
      this.columnDefs = this.createColumnDefs();
      this.actionDefs = this.createColumnActionDefs();
      this.pdfcolumnDefs = this.pdfcreateColumnDefs();

      this.FormControlDisable();
    }
  }

  Back() {

    this.router.navigate(["servicerequestlist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    setTimeout(() => this.serviceRequestform.disable(), 400);
    this.columnDefs = this.createColumnDefsRO();
    this.actionDefs = this.createColumnActionDefsRO();
    this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();

    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();

    if (this.serviceRequestId != null) this.serviceRequestform.patchValue(this.formData);
    else {
      this.serviceRequestform.reset();
      this.ngOnInit(true);
      setTimeout(() => this.serviceRequestform.disable(), 4000);
    }
  }

  FormControlDisable() {

    debugger;
    if (!this.user.isAdmin) {

      // if (this.accepted && this.IsEngineerView) {
      //   this.serviceRequestform.get('statusId').disable();
      // }

      this.serviceRequestform.get('baseCurrency').disable();
      this.serviceRequestform.get("baseCurrency").setValue(this.baseCurrId);
      // this.serviceRequestform.get('requesttypeid').disable();
      this.serviceRequestform.get('subRequestTypeId').disable();
      this.serviceRequestform.get('remarks').disable();
      this.serviceRequestform.get('custId').disable();
      this.serviceRequestform.get('siteId').disable();
      this.serviceRequestform.get('country').disable();
      this.serviceRequestform.get('distId').disable();
      if (this.IsEngineerView) {
        this.serviceRequestform.get('assignedTo').disable();
        this.serviceRequestform.get('country').disable();
        this.serviceRequestform.get('machinesNo').disable();
        this.serviceRequestform.get('breakdownType').disable();
        this.serviceRequestform.get('isRecurring').disable();
        this.serviceRequestform.get('recurringComments').disable();
        this.serviceRequestform.get('breakoccurDetailsId').disable();
        this.serviceRequestform.get('alarmDetails').disable();
        this.serviceRequestform.get('resolveAction').disable();
        this.serviceRequestform.get('visitType').disable();
        this.serviceRequestform.get('currentInstruStatus').disable();
        this.serviceRequestform.get("contactPerson").disable();
        this.serviceRequestform.get("email").disable();
        this.serviceRequestform.get('stageId').disable();
      } else if (this.IsDistributorView) {
        this.serviceRequestform.get('assignedTo').enable();
        this.serviceRequestform.get('country').disable();
        this.serviceRequestform.get('statusId').disable();
        if (this.isNewMode) {
          this.serviceRequestform.get('custId').enable();
          this.serviceRequestform.get('siteId').enable();
        }
        this.serviceRequestform.get('stageId').disable();
      } else {
        if (this.user.contactType?.toLocaleLowerCase() == "cs") {
          this.serviceRequestform.get('siteId').disable();
        }
        else {
          this.serviceRequestform.get('siteId').enable();
        }
        this.serviceRequestform.get('stageId').disable();
        this.serviceRequestform.get("contactPerson").disable();
        this.serviceRequestform.get("email").disable();
        this.serviceRequestform.get('assignedTo').disable();
        this.serviceRequestform.get('statusId').disable();
        this.serviceRequestform.get('stageId').disable();
        this.serviceRequestform.get('serReqDate').enable();

      }
      if (!this.isNotUnderAmc || this.IsCustomerView) {
        this.serviceRequestform.get('amcServiceQuote').disable();
      }
    }


  }

  ToggleDropdown(id: string) {
    document.getElementById(id).classList.toggle("show")
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {

      this.serviceRequestService.delete(this.serviceRequestId).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.router.navigate(["servicerequestlist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            })
          }
          else {
            this.notificationService.showError(data.messages[0], "Error");
          }
        })
    }
  }

  onCustomerChanged(value: any = this.customerId) {
    debugger;
    let object;
    if (value) {
      object = this.customerlist.find(x => x.id == value);
      //if(object != null && object != undefined){
      this.SetCustomerData(object)
      //}
    }
    //  else object = this.customerlist[0]    
  }

  isArray(obj) {
    return !!obj && obj.constructor === Array;
  }

  SetCustomerData(data: any) {
    debugger;
    if (!this.isArray(data))
      this.logindata = data;
    else
      this.logindata = data[0];

    this.serviceRequestform.patchValue({ "distId": this.logindata.defDistId });
    this.serviceRequestform.patchValue({ "country": this.logindata.countryId });
    this.serviceRequestform.patchValue({ "custId": this.logindata.id });
    this.serviceRequestform.patchValue({ "companyName": this.logindata?.custName });
    this.distId = this.logindata.defDistId;
    this.customerId = this.logindata.id;

    if (!this.IsDistributorView) {
      this.serviceRequestform.patchValue({ "contactPerson": this.user?.firstName + ' ' + this.user?.lastName });
      this.serviceRequestform.patchValue({ "email": this.user?.email });
    }

    if (this.logindata.sites != null) {
      //this.siteId = this.logindata.sites[0].id
      //this.customerSitelist = this.logindata.sites;
      this.customerSitelist = [];
      let siteLst = this.user.custSites?.split(",")
      this.logindata.sites.forEach(element => {
        if (siteLst?.length > 0 && this.user.contactType?.toLocaleLowerCase() == "cs" && siteLst?.find(x => x == element.id) == null) return;
        this.customerSitelist.push(element);
      })
      if (this.serviceRequestId == null) {
        this.serviceRequestform.patchValue({ "siteName": this.logindata.sites[0].custRegName });
        this.serviceRequestform.patchValue({ "siteId": this.logindata.sites[0].id });
        this.siteId = this.logindata.sites[0].id;
        this.getInstrumnetsBySiteIds(this.logindata.sites[0].id);
        this.getSiteUsers(this.siteId);
      }
    }
  }

  onSiteChanged(value: any) {
    if(value != "")    {
      this.getInstrumnetsBySiteIds(value); 
      this.getSiteUsers(value);
    }
  }

  getSiteUsers(id:any)
  {
    this.serviceRequestService.GetSiteUsers(id).pipe(first())
      .subscribe({
        next: (data: any) => {
          this.siteUsers = data.data;
          if(this.siteUserId != null)
          {
            this.serviceRequestform.patchValue({ "siteUserId": this.siteUserId });  
          }
        }
      });
  }

  onMachineNoChanged(value: any) {
    this.oninstuchange(value);
  }

  getInstrumnetsBySiteIds(id: any) {
    this.customerInstrumentService.GetInstrumentBySite(id).pipe(first())
      .subscribe({
        next: (data: any) => {
          this.instrumentList = data.data
        }
      });
  }


  public oninstuchange(id: string) {
    var instument;

    //this.instrumentService.getSerReqInstrument(id)
    this.serviceRequestService.GetInstrument(id, this.siteId).pipe(first())
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          instument = data.data;
          this.siteId = data.data.custSiteId;
          this.serviceRequestform.patchValue({ "machModelName": instument.insType });
          this.serviceRequestform.patchValue({ "operatorName": instument.operatorEng.firstName + '' + instument.operatorEng.lastName });
          this.serviceRequestform.patchValue({ "operatorNumber": instument.operatorEng.primaryContactNo });
          this.serviceRequestform.patchValue({ "operatorEmail": instument.operatorEng.primaryEmail });
          this.serviceRequestform.patchValue({ "machEngineer": instument.machineEng.firstName + ' ' + instument.machineEng.lastName });
          this.serviceRequestform.patchValue({ "xrayGenerator": instument.insVersion });
        },
      });
  }


  // convenience getter for easy access to form fields
  get f() {
    return this.serviceRequestform.controls;
  }

  get a() {
    return this.serviceRequestform.controls.engineer;
  }

  onSubmit(redirect = true) {
    debugger;
    this.submitted = true

    // reset alerts on submit
    this.alertService.clear();

    let servicetypeCode = this.serviceTypeList?.filter(x => x.listTypeItemId == this.serviceRequestform.get('visitType').value)[0]?.itemCode;
    if (servicetypeCode == "AMC" || servicetypeCode == "PLAN" || servicetypeCode == "PREV") {
      if (this.serviceRequestform.get('sDate').value == "") {
        return this.notificationService.showError("Start Date is required.", "Error")
      }
      if (this.serviceRequestform.get('eDate').value == "") {
        return this.notificationService.showError("End Date is required.", "Error")
      }
    }
    this.serviceRequestform.markAllAsTouched();
    this.serviceRequestform.get('subRequestTypeId').enable();
    if (this.IsEngineerView && this.serviceRequestform.get('statusId').value == "") {
      return this.notificationService.showError("Status is required", "Error");
    }
    // if (this.IsEngineerView && this.accepted) {
    //   if (!this.hasCallScheduled) {
    //     return this.notificationService.showError("As u have accepted the request please schedule a call to process further.", "Error")
    //   }
    // }

    if (this.serviceRequestform.get('serResolutionDate').value && this.serviceRequestform.get('serResolutionDate').value < GetParsedDate(this.serviceRequestform.get("serReqDate").value)) {
      this.notificationService.showError("The Resolution Date should be after Service Request Date", "Invalid Date")
    }

    // reset alerts on submit
    this.alertService.clear();

    if (this.serviceRequestform.invalid || !this.serviceRequestform.get('subRequestTypeId').value) {
      return;// this.notificationService.showError("Please Check Form again", "Error");
    }

    if (this.isGenerateReport != false) return
    // stop here if form is invalid

    const datepipie = new DatePipe("en-US");

    let sDate = this.serviceRequestform.get('sDate').value
    let eDate = this.serviceRequestform.get('eDate').value
    let serResolutionDate = this.serviceRequestform.get('serResolutionDate').value

    if ((sDate != "" && sDate != null) && (eDate != "" && eDate != null)) {
      let dateSent = GetParsedDate(sDate);
      let currentDate = GetParsedDate(eDate);

      let calc = Math.floor(
        (Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ) - Date.UTC(
          dateSent.getFullYear(),
          dateSent.getMonth(),
          dateSent.getDate()
        )) /
        (1000 * 60 * 60 * 24)
      );

      if (calc <= 0)
        return this.notificationService.showError("End Date should not be greater than Start Date", "Error");

      this.serviceRequestform.get('sDate').setValue(datepipie.transform(dateSent, 'dd/MM/YYYY'));
      this.serviceRequestform.get('eDate').setValue(datepipie.transform(currentDate, 'dd/MM/YYYY'));

    }

   

    if (this.serviceRequestId == null) {

      this.serviceRequest = this.serviceRequestform.getRawValue();
      this.serviceRequest.engComments = [];
      this.serviceRequest.assignedHistory = [];
      this.serviceRequest.engAction = [];
      this.serviceRequest.serResolutionDate = datepipie.transform(serResolutionDate, 'dd/MM/YYYY');
      this.serviceRequest.siteId = this.siteId;
      this.serviceRequest.custId = this.customerId;
      if(this.serviceRequest.breakoccurDetailsId == null)
      {
        this.serviceRequest.breakoccurDetailsId = this.emptyGuid;
      }
      if (this.serviceRequest.isRecurring == null) {
        this.serviceRequest.isRecurring = false;
      }

      if (this.serviceRequestform.get('subRequestTypeId').value.length > 0) {
        var selectarray = this.serviceRequestform.get('subRequestTypeId').value;
        this.serviceRequest.subRequestTypeId = selectarray.map(x => x.itemCode).join(',');
      }

      if (this.IsCustomerView == true)
        this.serviceRequest.serResolutionDate = null


      this.serviceRequestService.save(this.serviceRequest)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.saveFileShare(data.data.id);
              if (this.file != null) {
                this.uploadPdfFile(this.file, data.data.id)
              }
              // request cannot be assigned while creating.
              // if (this.IsDistributorView) {
              //   this.addAssignedHistory(this.serviceRequest);
              // }
              this.notificationService.showSuccess(data.messages[0], "Success");
              if (redirect)
                this.router.navigate(["servicerequestlist"], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
            }
            else { this.notificationService.showError(data.messages[0], "Error"); }
          },
        });
    }
    else {
      this.serviceRequest = this.serviceRequestform.getRawValue();
      this.serviceRequest.id = this.serviceRequestId;
      this.serviceRequest.siteId = this.siteId;
      this.serviceRequest.custId = this.customerId;
      this.serviceRequest.engComments = [];
      this.serviceRequest.assignedHistory = [];
      this.serviceRequest.engAction = [];
      this.serviceRequest.serResolutionDate = datepipie.transform(GetParsedDate(serResolutionDate), 'dd/MM/YYYY');
      if(this.serviceRequest.breakoccurDetailsId == null)
      {
        this.serviceRequest.breakoccurDetailsId = this.emptyGuid;
      }

      if (this.IsEngineerView && this.serviceRequest.isCritical) this.serviceRequest.isCritical = false;
      if (this.serviceRequestform.get('subRequestTypeId').value.length > 0) {
        var selectarray = this.serviceRequestform.get('subRequestTypeId').value;
        this.serviceRequest.subRequestTypeId = selectarray;
        if (typeof (selectarray) != "string") {
          this.serviceRequest.subRequestTypeId = selectarray.map(x => x.itemCode).join(',');
        }
      }

      this.serviceRequestService.update(this.serviceRequestId, this.serviceRequest)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.saveFileShare(this.serviceRequestId);
              if (this.file != null) {
                this.uploadPdfFile(this.file, this.serviceRequestId)
              }
              if (this.IsDistributorView) {
                this.addAssignedHistory(this.serviceRequest);
              }
              this.notificationService.showSuccess(data.messages[0], "Success");
              if (this.IsEngineerView && this.accepted) {
                if (!this.hasCallScheduled) {
                  this.notificationService.showInfo("As u have accepted the request please schedule a call to process further.", "Info")
                }
              }
              else {
                if (redirect)
                  this.router.navigate(["servicerequestlist"], {
                    //relativeTo: this.activeRoute,
                    queryParams: { isNSNav: true },
                    //queryParamsHandling: 'merge'
                  });
              }
            }
          }
        });
    }
  }

  onStatusChange() {
    let assignedStatusId = this.statuslist.find(x => x.itemCode == "ASSGN")?.listTypeItemId
    let notAssignedStatusId = this.statuslist.find(x => x.itemCode == "NTASS")?.listTypeItemId
    if (this.accepted) {
      return this.notificationService.showInfo("Service request is accepted and you cannot assign it to another engineer.", "Info");
    }
    else {
      if (this.IsDistributorView && this.serviceRequestform.get('assignedTo').value != null && this.serviceRequestform.get('assignedTo').value != "") {
        if (this.serviceRequestform.get('statusId').value != "" && this.serviceRequestform.get('statusId').value == notAssignedStatusId) {
          this.serviceRequestform.get('statusId').setValue(assignedStatusId);
        }

        let allocStage = this.stagelist.find(x => x.itemCode == "SRALL")?.listTypeItemId
        this.serviceRequestform.get('stageId').setValue(allocStage);
      }
    }
  }

  onServiceTypeChange(serviceTypeId) {
    this.isAmc = false;
    let servicetypeCode = this.serviceTypeList?.filter(x => x.listTypeItemId == serviceTypeId)[0]?.itemCode;
    debugger;
    if (servicetypeCode == "AMC" || servicetypeCode == "PLAN" || servicetypeCode == "PREV") {
      this.isAmc = true;
      if (servicetypeCode != "PREV") {
        this.serviceRequestform.get('sDate').setValidators(Validators.required)
        this.serviceRequestform.get('sDate').updateValueAndValidity()
        this.serviceRequestform.get('sDate').reset()

        this.serviceRequestform.get('eDate').setValidators(Validators.required)
        this.serviceRequestform.get('eDate').updateValueAndValidity()
        this.serviceRequestform.get('eDate').reset()
      }
      this.serviceRequestform.get('breakoccurDetailsId').clearValidators()
      this.serviceRequestform.get('breakoccurDetailsId').updateValueAndValidity()
      this.serviceRequestform.get('breakoccurDetailsId').reset()

      this.serviceRequestform.get('alarmDetails').clearValidators()
      this.serviceRequestform.get('alarmDetails').updateValueAndValidity()
      this.serviceRequestform.get('alarmDetails').reset()

      this.serviceRequestform.get('breakdownType').clearValidators()
      this.serviceRequestform.get('breakdownType').updateValueAndValidity()
      this.serviceRequestform.get('breakdownType').reset()
    }
    else {
      this.isAmc = false;
      this.serviceRequestform.get('sDate').clearValidators()
      this.serviceRequestform.get('sDate').updateValueAndValidity()
      this.serviceRequestform.get('sDate').reset()

      this.serviceRequestform.get('eDate').clearValidators()
      this.serviceRequestform.get('eDate').updateValueAndValidity()
      this.serviceRequestform.get('eDate').reset()

      this.serviceRequestform.get('breakoccurDetailsId').setValidators(Validators.required)
      this.serviceRequestform.get('breakoccurDetailsId').updateValueAndValidity()
      this.serviceRequestform.get('breakoccurDetailsId').reset()

      this.serviceRequestform.get('alarmDetails').setValidators(Validators.required)
      this.serviceRequestform.get('alarmDetails').updateValueAndValidity()
      this.serviceRequestform.get('alarmDetails').reset()

      this.serviceRequestform.get('breakdownType').setValidators(Validators.required)
      this.serviceRequestform.get('breakdownType').updateValueAndValidity()
      this.serviceRequestform.get('breakdownType').reset()

    }
  }

  Accepted(value) {
    if (!value) return;

    let notacceptedStat = this.statuslist.find(x => x.itemCode == "NTACP")?.listTypeItemId
    if (value == notacceptedStat) {
      let inPrgStage = this.stagelist.find(x => x.itemCode == "SRALL")?.listTypeItemId
      this.serviceRequestform.get('stageId').setValue(inPrgStage);
      this.accepted = false;
    }
    else {
      let inPrgStage = this.stagelist.find(x => x.itemCode == "INPGS")?.listTypeItemId
      this.serviceRequestform.get('stageId').setValue(inPrgStage);
      this.accepted = true
    }
    this.onSubmit();

    // let currentStatus = this.statuslist.find(x => x.listTypeItemId == value)?.itemCode
    // if (currentStatus != "ACPTD") return;
    // if (this.isGenerateReport) return;

    // this.accepted = true
    // this.hasCallScheduled = false;
    // let serviceRequest = new ServiceRequest();
    // serviceRequest.id = this.serviceRequestId;
    // serviceRequest.accepted = true

    // this.serviceRequestform.get('statusId').disable();
    // let assignedStat = this.statuslist.find(x => x.itemCode == "ACPTD")?.listTypeItemId
    // // this.serviceRequestform.get('statusId').setValue(assignedStat);
    // let inPrgStage = this.stagelist.find(x => x.itemCode == "INPGS")?.listTypeItemId
    // this.serviceRequestform.get('stageId').setValue(inPrgStage);
    // serviceRequest.statusid = assignedStat
    // serviceRequest.stageId = inPrgStage

    // this.serviceRequestService.updateIsAccepted(this.serviceRequestId, serviceRequest)
    //   .subscribe((data: any) => {
    //     this.serviceRequestform.get('accepted').disable();
    //     this.serviceRequestform.get('accepted').setValue(true)
    //     this.notificationService.showSuccess(data.messages[0], "Success");
    //   })

  }

  generatereport() {
    debugger;
    if (this.isGenerateReport == false) {
      this.onSubmit();
      let scheduleCalls = this.scheduleData.filter(x => x.serReqId == this.serviceRequestId)
      if (this.scheduleData == null || this.scheduleData.length <= 0 || scheduleCalls.length <= 0) {
        return this.notificationService.showError("Cannot Generate Report. No Calls Had been Scheduled in the Scheduler", "Error")
      }

      this.servicereport = new ServiceReport();

      this.servicereport.serviceRequestId = this.serviceRequestId;
      this.servicereport.customer = this.serviceRequestform.get('companyName').value;
      this.servicereport.srOf = this.user.firstName + '' + this.user.lastName + '/' + this.countries.find(x => x.id == this.serviceRequestform.get('country').value)?.name + '/' + this.datepipe.transform(GetParsedDate(this.serviceRequestform.get('serReqDate').value), 'yyyy-MM-dd');
      this.servicereport.country = this.countries.find(x => x.id == this.serviceRequestform.get('country')?.value)?.name;
      this.servicereport.problem = this.breakdownlist.find(x => x.listTypeItemId == this.serviceRequestform.get('breakoccurDetailsId').value)?.itemName + '-' + this.serviceRequestform.get('alarmDetails')?.value;
      this.servicereport.instrumentId = this.serviceRequestform.get('machinesNo').value;

      // this.buBrandModel = new BUBrandModel();
      // this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId;
      // this.buBrandModel.brandId = this.user.selectedBrandId;
      // this.customerInstrumentService.getAll(this.buBrandModel)
      //   .pipe(first())
      //   .subscribe((data: any) => {
      //     let instrumentList = data.data;
      //    this.servicereport.instrumentId = instrumentList.find(x => x.id == this.serviceRequestform.get('machinesNo').value)?.id;
      // });

      if (this.isAmc) this.servicereport.problem = 'AMC';

      this.servicereport.installation = (this.serviceRequestform.get('subRequestTypeId').value?.split(",").filter(x => x == this.environment.INS)).length > 0;
      this.servicereport.analyticalAssit = (this.serviceRequestform.get('subRequestTypeId').value?.split(",").filter(x => x == this.environment.ANAS)).length > 0;
      this.servicereport.prevMaintenance = (this.serviceRequestform.get('subRequestTypeId').value?.split(",").filter(x => x == this.environment.PRMN1)).length > 0;
      this.servicereport.rework = (this.serviceRequestform.get('subRequestTypeId').value?.split(",").filter(x => x == this.environment.REWK)).length > 0;
      this.servicereport.corrMaintenance = (this.serviceRequestform.get('subRequestTypeId').value?.split(",").filter(x => x == this.environment.CRMA)).length > 0;
      if (this.customerId != null) {
        this.customerService.getById(this.customerId)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              this.custcityname = data.data.city;
              this.servicereport.town = this.custcityname;
              this.servicereport.customer = data.data.custName;

              this.servicereportService.save(this.servicereport)
                .pipe(first())
                .subscribe({
                  next: (data: any) => {
                    if (data.isSuccessful) {
                      this.notificationService.showSuccess(data.messages[0], "Success");

                      this.srAssignedHistory = new ticketsAssignedHistory;
                      this.srAssignedHistory.engineerId = this.engineerid;
                      this.srAssignedHistory.serviceRequestId = this.serviceRequestId;
                      this.srAssignedHistory.ticketStatus = "INPRG";
                      this.srAssignedHistory.assignedDate = new Date()

                      this.srAssignedHistoryService.save(this.srAssignedHistory).pipe(first()).subscribe();

                      this.router.navigate(["servicereport", data.data], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                    }
                  }
                });
            }
          });
      }
      else {
        this.servicereportService.save(this.servicereport)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.isSuccessful) {
                this.notificationService.showSuccess(data.messages[0], "Success");

                this.srAssignedHistory = new ticketsAssignedHistory;
                this.srAssignedHistory.engineerId = this.engineerid;
                this.srAssignedHistory.serviceRequestId = this.serviceRequestId;
                this.srAssignedHistory.ticketStatus = "INPRG";
                this.srAssignedHistory.assignedDate = new Date();

                this.srAssignedHistoryService.save(this.srAssignedHistory).pipe(first()).subscribe();

                this.router.navigate(["servicereport", data.data], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
              }
            }
          });
      }
    }
  }

  addAssignedHistory(sr: ServiceRequest) {
    if (this.engineerid != this.emptyGuid && this.engineerid != sr.assignedTo && this.isGenerateReport == false) {
      debugger;
      this.srAssignedHistory = new ticketsAssignedHistory;
      this.srAssignedHistory.engineerId = this.engineerid;
      this.srAssignedHistory.serviceRequestId = sr.id;
      this.srAssignedHistory.ticketStatus = "INPRG";
      this.srAssignedHistory.assignedDate = new Date()

      this.srAssignedHistoryService.save(this.srAssignedHistory)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) this.router.navigate(["servicerequestlist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            })
          }
        });
    }
  }

  getDistRegnContacts(distid: string) {
    this.distributorService.getDistributorRegionContacts(distid, "blank")
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.appendList = data.data;
        }
      });
  }

  saveFileShare(id: string) {
    if (this.pdfPath != null && this.isGenerateReport == false) {
      for (var i = 0; i < this.pdfPath.length; i++) {
        let fileshare = new FileShare();
        fileshare.fileName = this.pdfPath[i].fileName;
        fileshare.filePath = this.pdfPath[i].filepath;
        fileshare.parentId = id;
        this.fileshareService.save(fileshare)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.isSuccessful) {
                this.notificationService.showSuccess(data.messages[0], "Success");
                this.router.navigate(["servicerequestlist"], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
              }
            }
          });
      }
    }
  }

  getPdffile(filePath: string) {
    if (filePath != null && filePath != "") {
      this.uploadService.getFile(filePath)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.download(data.data);
          },
        });
    }
  }

  download(fileData: any) {
    const byteArray = new Uint8Array(atob(fileData).split('').map(char => char.charCodeAt(0)));
    let b = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(b);
    window.open(url);
  }

  getfil(x) {
    this.file = x;
  }

  listfile = (x) => {
    document.getElementById("selectedfiles").style.display = "block";

    var selectedfiles = document.getElementById("selectedfiles");
    var ulist = document.createElement("ul");
    ulist.id = "demo";
    selectedfiles.appendChild(ulist);

    if (this.transaction != 0) {
      document.getElementById("demo").remove();
    }

    this.transaction++;
    this.hastransaction = true;

    for (let i = 0; i <= x.length; i++) {
      var name = x[i].name;
      var ul = document.getElementById("demo");
      var node = document.createElement("li");
      var textnode = document.createTextNode(name)
      node.appendChild(textnode);

      ul.appendChild(node);

    }
  };

  public onRowClicked(e) {
    if (e.event.target !== undefined && this.isGenerateReport == false) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the engineer comment?") == true) {
            this.engcomservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.isSuccessful) this.notificationService.showSuccess(d.messages[0], "Success");
                }
              });
          }
        case "edit":
          this.open(this.serviceRequestId, data.id, this.engineerid);
      }
    }
  }

  onCellValueChanged(event) {
    event.data.modified = true;
  }

  private pdfcreateColumnDefs() {
    return [
      {
        headerName: "Action",
        field: "id",
        filter: false,
        editable: false,
        lockPosition: "left",
        sortable: false,
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess && this.isGenerateReport == false,
          id: this.serviceRequestId
        },
      },
      {
        headerName: "File Name",
        field: "displayName",
        filter: true,
        tooltipField: "File Name",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  private pdfcreateColumnDefsRO() {
    return [
      {
        headerName: "File Name",
        field: "displayName",
        filter: true,
        tooltipField: "File Name",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  pdfonGridReady(params): void {
    this.pdfapi = params.api;
    this.pdfcolumnApi = params.columnApi;
    this.pdfapi.sizeColumnsToFit();
  }

  historyready(params): void {
    this.historyapi = params.api;
    this.historycolumnApi = params.columnApi;
  }

  public getAllInstrument(siteId: string) {
    this.customerInstrumentService.GetInstrumentBySite(siteId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.instrumentList = data.data;
        },
      });
  }

  private createColumnDefsRO() {
    return [
      {
        headerName: 'Next Date',
        field: 'nextDate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'nextDate',
      },
      {
        headerName: 'Comments',
        field: 'comments',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ]
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        lockPosition: "left",
        sortable: false,
        hide: this.isGenerateReport,
        cellRenderer: (params) => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
          }
        }
      },
      {
        headerName: 'Next Date',
        field: 'nextDate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'nextDate',
      },
      {
        headerName: 'Comments',
        field: 'comments',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      }
    ]
  }


  private createColumnHistoryDefs() {
    return [
      {
        headerName: 'Engineer Name',
        field: 'engineerName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'engineerName',
      },
      {
        headerName: 'Assigned Date',
        field: 'assignedDate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Comments',
        field: 'comments',
        width: 600,
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
    ]
  }

  private createColumnActionDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        hide: !this.IsEngineerView && this.isGenerateReport == false,
        sortable: false,
        lockPosition: "left",
        cellRenderer: (params) => {
          if (this.hasDeleteAccess && !this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          } else if (this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>
          <button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
          } else if (!this.hasDeleteAccess && this.hasUpdateAccess) {
            return `<button type="button" class="btn btn-link" data-action-type="edit" ><i class="fas fas fa-pen" title="Edit Value" data-action-type="edit"></i></button>`
          }
        }
      },
      {
        headerName: 'Engineer Name',
        field: 'engineerName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'engineerName',
      },
      {
        headerName: 'Action Taken',
        field: 'actiontakenName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Comments',
        field: 'comments',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Date',
        field: 'actionDate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Team Viewer Recording',
        field: 'teamviewRecording',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRenderer: (params) => {
          if (params.value != null) {
            return `<button type="button" class="btn btn-link" data-action-type="download" ><i class="fas fas fa-download" title="Edit Value" data-action-type="download"></i></button>`
          } else {
            return ``
          }
        }
      }
    ]
  }

  private createColumnActionDefsRO() {
    return [
      {
        headerName: 'Engineer Name',
        field: 'engineerName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'engineerName',
      },
      {
        headerName: 'Action Taken',
        field: 'actiontakenName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Comments',
        field: 'comments',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Date',
        field: 'actionDate',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Team Viewer Recording',
        field: 'teamviewRecording',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRenderer: (params) => {
          if (params.value != null) {
            return `<button type="button" class="btn btn-link" data-action-type="download" ><i class="fas fas fa-download" title="Edit Value" data-action-type="download"></i></button>`
          } else {
            return ``
          }
        }
      }
    ]
  }

  private createColumnScheduleDefs() {
    return [
      {
        headerName: 'EngName',
        field: 'engineerName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Title',
        field: 'subject',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        tooltipField: 'engineerName',
      },
      {
        headerName: 'Location and Date ',
        field: 'Time',
        width: 450,
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false
      },
      {
        headerName: 'Description ',
        field: 'description',
        filter: false,
        width: 300,
        enableSorting: false,
        editable: false,
        sortable: false
      },

    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  uploadPdfFile(files, serviceRequestId) {
    if (this.isGenerateReport == false) {
      if (files.length === 0) {
        return;
      }

      let filesToUpload: File[] = files;
      const formData = new FormData();

      Array.from(filesToUpload).map((file, index) => {
        return formData.append("file" + index, file, file.name);
      });

      this.fileshareService.upload(formData, serviceRequestId, "SRREQ").subscribe((event) => { });
    }
  }


  open(param: string, param1: string, param2: string) {
    if (this.isGenerateReport == false) {
      const initialState = {
        itemId: param,
        id: param1,
        engineerid: this.engineerid,
        item: this.serviceRequestform.value
      };
      this.bsModalRef = this.modalService.show(ModelEngContentComponent, { initialState });
    }
  }

  openaction(param: string, param1: string) {
    if (this.isGenerateReport == false) {
      const modalOptions: any = {
        backdrop: 'static',
        ignoreBackdropClick: true,
        keyboard: false,
        initialState: {
          itemId: param,
          id: param1,
          engineerid: this.engineerid,
          engineerlist: this.appendList,
          item: this.serviceRequestform.value
        },
      }
      this.bsActionModalRef = this.modalService.show(ModelEngActionContentComponent, modalOptions);
    }
  }

  public onactionRowClicked(e) {
    if (e.event.target !== undefined && this.isGenerateReport == false) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the engineer action?") == true) {
            this.actionservice.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.isSuccessful) {
                    this.notificationService.showSuccess(d.messages[0], "Success");
                    const selectedData = this.api.getSelectedRows();
                    this.api.applyTransaction({ remove: selectedData });
                  }
                }
              });
          }
          break
        case "edit":
          this.openaction(this.serviceRequestId, data.id);
          break

        case "download":
          let params: any = {}
          params.id = e.data.id;
          params.fileUrl = e.data.teamviewerRecording

          if (e.data.teamviewerRecording != null || params.teamviewerRecording == null) {
            this.downloadTeamViewerRecording(params)
          } else {
            this.notificationService.showError("No Recording ", "Error")
          }
          break

      }
    }
  }


  downloadTeamViewerRecording(params: any) {
    this.fileshareService.download(params.id, "/SRATN").subscribe((event) => {
      if (event.type === HttpEventType.Response)
        this.downloadFile(params, event);

    });
  }

  private downloadFile(params, data: HttpResponse<Blob>) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement("a");
    a.setAttribute("style", "display:block;");
    document.body.appendChild(a);
    a.download = params.id;
    a.href = URL.createObjectURL(downloadedFile);
    a.innerHTML = params.fileUrl;
    a.target = "_blank";
    a.click();
    document.body.removeChild(a);
  }

  public onhisRowClicked(e) {

  }

  close() {
    alert('test');
    this.bsModalRef.hide();
  }
}

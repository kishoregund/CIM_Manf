import { Component, OnInit, ViewChild } from '@angular/core';
import { ListTypeItem, ProfileReadOnly, User } from "../_models";
import {
  AccountService,
  ListTypeService,
  NotificationService,
} from "../_services";
import { first } from "rxjs/operators";
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CustomerdashboardService } from '../_services/customerdashboard.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CostofownershipComponent } from '../costofownership/costofownership.component';
import { OfferrequestService } from '../_services/Offerrequest.service';
import { CustspinventoryService } from '../_services/custspinventory.service';
import { DistributorService } from '../_services/distributor.service';
import { ServiceRequestService } from '../_services/serviceRequest.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { CustomerSiteService } from '../_services/customersite.service';

declare function CustomerDashboardCharts(): any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  user: UserDetails;

  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;


  customerName: string
  customerCountry: string;
  totalCustContacts: number = 0
  custDefDistName: string
  custDefDistId: any
  defDistCountryName: any
  spRecomList: any

  currentIndex = 0;
  custSite = []
  siteName: string = ""
  siteRegion: string = ""
  currentSiteId: string;
  lstInstrument: any;
  serviceRequestform: any;
  reqtypelist: ListTypeItem[];
  datepipe: any = new DatePipe("en-US");
  logindata: any;
  distId: any;
  siteId: string;  
  customerId: any;
  serviceTypeList: ListTypeItem[];
  serviceRequest: any;
  srList: any;
  amcData: any;
  bsModalRef: BsModalRef;
  calenderLst = ["3MNTHS", "6MNTHS", "12MNTHS"]
  costData: any[];

  @ViewChild('3MNTHS') Mnths3;
  @ViewChild('6MNTHS') Mnths6;
  @ViewChild('12MNTHS') Mnths12;

  instruemntLength = 0;
  shipmentInProcess: number = 0;
  isHidden: boolean = true;
  spInventory: any;
  isSiteContact: boolean;
  emptyGuid = '00000000-0000-0000-0000-000000000000';

  constructor(
    private accountService: AccountService,
    private distributorService: DistributorService,
    private serviceRequestService: ServiceRequestService,
    private notificationService: NotificationService,
    private formbuilder: FormBuilder,
    private customersiteService: CustomerSiteService,
    private listTypeItemService: ListTypeService,
    private modalService: BsModalService,
    private customerDashboardService: CustomerdashboardService,
    private offerRequestService: OfferrequestService,
    private custSpInventoryService: CustspinventoryService
  ) {
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.isSiteContact = this.user.contactType.toLowerCase() != "cs"

    setTimeout(() => {
      this.CalenderChange(365)
    }, 500);

    this.customerDashboardService.GetCustomerDetails()
      .subscribe((data: any) => {
        let cust = data.data
        this.custSite = cust.sites;

        this.siteName = this.custSite[this.currentIndex].custRegName;
        this.siteRegion = this.custSite[this.currentIndex].regName;
        this.currentSiteId = this.custSite[this.currentIndex].id;
        this.customerName = cust?.custName;
        this.GetInstrumentsByCurrentSiteId()
        this.customerCountry = cust?.countryName
        //this.custDefDistName = cust.Distributor
        this.custDefDistId = cust.defDistId

        this.totalCustContacts = 0;
        cust.sites.forEach(y => this.totalCustContacts += y.siteContacts.length)

        this.distributorService.getById(cust.defDistId)
          .pipe(first()).subscribe((dist: any) => {
            debugger;
            this.defDistCountryName = dist.data.addrCountryName;
            this.custDefDistName = dist.data.distName;
          })

      })

    this.offerRequestService.getAll().pipe(first())
      .subscribe((OfReqData: any) => this.shipmentInProcess = OfReqData.data?.filter(x => !x.isCompleted && x.isShipment)?.length)

    
    this.custSpInventoryService.getAll(this.user.contactId, this.emptyGuid).pipe(first())
      .subscribe((spInv: any) => this.spInventory = spInv.data)
  }

  CalenderChange(days) {
    this.BtnBackgroundChange(days)
    var e = new Date();
    var s = new Date(new Date().setDate(e.getDate() - days));
    this.onCalenderFilter(s, e)
  }

  dateRange(va) {
    if (!va || va.length <= 1) return;

    let sDate = new Date(va[0]);
    let eDate = new Date(va[1]);
    var diff = eDate.getDate() - sDate.getDate()
    this.BtnBackgroundChange(diff);
    this.onCalenderFilter(sDate, eDate);
  }

  BtnBackgroundChange(diff) {
    switch (diff) {
      case 90:
        this.Mnths3.nativeElement.classList.add("active")
        this.Mnths6.nativeElement.classList.remove("active")
        this.Mnths12.nativeElement.classList.remove("active")
        break;

      case 180:
        this.Mnths6.nativeElement.classList.add("active")
        this.Mnths3.nativeElement.classList.remove("active")
        this.Mnths12.nativeElement.classList.remove("active")
        break;

      case 365:
        this.Mnths12.nativeElement.classList.add("active")
        this.Mnths6.nativeElement.classList.remove("active")
        this.Mnths3.nativeElement.classList.remove("active")
        break;

      default:
        this.Mnths6.nativeElement.classList.remove("active")
        this.Mnths3.nativeElement.classList.remove("active")
        this.Mnths12.nativeElement.classList.remove("active")
        break;

    }
  }

  toggle = () => this.isHidden = !this.isHidden

  onCalenderFilter(sdate, edate) {
    this.getServiceRequestData(sdate, edate);
    this.GetAllSpareQuote(sdate, edate);
    this.GetPoCost(sdate, edate);
    this.GetSparePartsRecommended(sdate, edate);
    setTimeout(() => CustomerDashboardCharts(), 2000)
  }


  GetSparePartsRecommended(sdate, edate) {
    this.customerDashboardService.GetSparePartsRecommended()
      .subscribe((data: any) => {
        this.spRecomList = [];
        data.data.forEach((value) => {
          if (this.GetDiffDate(new Date(value.createdOn), edate, sdate)) {
            value.assignedToFName = value.assignedToFName + " " + value.assignedToLName
            this.spRecomList.push(value)
          }
        })
      });

  }

  getServiceRequestData(sdate, edate) {
    this.customerDashboardService.GetAllServiceRequest()
      .pipe(first()).subscribe((data: any) => {
        debugger;
        let label = []
        var pendingRequestLabels = []
        var pendingRequestValue = []
        let chartData = []
        let bgColor = []
        let pendingrequestBgColor = []
        // data.data = data.data.filter(x => !x.isReportGenerated)
        data.data.forEach(x => {
          if (!this.GetDiffDate(new Date(x.createdon), edate, sdate)) return;
          console.log(x);

          if (x.isCompleted == false) pendingRequestLabels.push(x.visitTypeName)
          else label.push(x.visitTypeName)
        })
debugger;
        label = [... new Set(label)]
        pendingRequestLabels = [... new Set(pendingRequestLabels)]

        for (let i = 0; i < label.length; i++) {
          const element = label[i];
          chartData.push(data.data.filter(x => x.visitTypeName == element && x.isCompleted == true && this.GetDiffDate(new Date(x.createdon), edate, sdate)).length)
          bgColor.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
        }

        for (let i = 0; i < pendingRequestLabels.length; i++) {
          const element = pendingRequestLabels[i];
          pendingRequestValue.push(data.data.filter(x => x.visitTypeName == element && x.isCompleted == false && this.GetDiffDate(new Date(x.createdon), edate, sdate)).length)
          pendingrequestBgColor.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`)
        }

        sessionStorage.setItem('servicerequesttype', JSON.stringify({ label, chartData }))
        sessionStorage.setItem('pendingservicerequest', JSON.stringify({ chartData: pendingRequestValue, label: pendingRequestLabels }))

        this.srList = data.data.filter(x => this.GetDiffDate(new Date(x.createdon), edate, sdate));
      });

  }

  GetAllSpareQuote(sdate, edate) {
    this.customerDashboardService.AllOfferRequest()
      .subscribe((data: any) =>
        this.amcData = data.data.filter(x => this.GetDiffDate(new Date(x.createdon), edate, sdate) && !x.isCompleted))
  }

  GetDiffDate(createdOn: Date, edate: Date, sdate: Date) {
    var seCompare = edate.getTime() - sdate.getTime()
    seCompare = seCompare / (1000 * 60 * 60 * 24)

    var eCompare = edate.getTime() - createdOn.getTime()
    eCompare = eCompare / (1000 * 60 * 60 * 24)

    var sCompare = createdOn.getTime() - sdate.getTime()
    sCompare = sCompare / (1000 * 60 * 60 * 24)

    if (sCompare < 0) return false;
    if (seCompare < 0) return false;
    if (eCompare < 0) return false;
    return true;
  }


  next() {
    let max = this.custSite.length - 1;
    this.currentIndex != max ? this.currentIndex++ : this.currentIndex = 0;

    this.siteName = this.custSite[this.currentIndex].custRegName;
    this.siteRegion = this.custSite[this.currentIndex].regName;
    this.currentSiteId = this.custSite[this.currentIndex].id;
    this.GetInstrumentsByCurrentSiteId();
  }

  GetPoCost(sdate, edate) {
    this.customerDashboardService.GetCostData({ sdate, edate })
      .pipe(first()).subscribe((data: any) => {
        sessionStorage.setItem("costData", JSON.stringify(data.data))
      })
  }

  OnPopUpOpen(instrumentId) {
    const initialState = { instrumentId }
    this.bsModalRef = this.modalService.show(CostofownershipComponent, { initialState });

  }


  GetInstrumentsByCurrentSiteId() {
    this.customerDashboardService.GetSiteInstrument(this.currentSiteId)
      .subscribe((data: any) => {
        this.lstInstrument = data.data;
        this.instruemntLength = this.lstInstrument.length;
      })
  }

  prev() {
    this.currentIndex != 0 ? this.currentIndex-- : this.currentIndex++;
    this.siteName = this.custSite[this.currentIndex].custRegName;
    this.siteRegion = this.custSite[this.currentIndex].regName;
    this.currentSiteId = this.custSite[this.currentIndex].id;
    this.GetInstrumentsByCurrentSiteId();
  }


  criticalServiceRequest(insId) {
    this.serviceRequestform = this.formbuilder.group({
      sDate: [""],
      eDate: [""],
      serReqNo: [""],
      distId:  this.emptyGuid,
      custId:  this.emptyGuid,
      statusId: this.emptyGuid,
      stageId: this.emptyGuid,
      siteId: this.emptyGuid,
      assignedTo:  this.emptyGuid,
      serReqDate: [''],
      visitType: [''],
      companyName: [''],
      requestTime: [''],
      siteName: [''],
      country: [''],
      contactPerson: [''],
      email: [''],
      operatorName: [''],
      operatorNumber: [''],
      operatorEmail: [''],
      machmodelName: [''],
      machinesNo: [''],
      machEngineer: [''],
      xrayGenerator: [''],
      breakdownType: [''],
      isRecurring: [false],
      recurringComments: [''],
      breakoccurDetailsId:  this.emptyGuid,
      alarmDetails: [''],
      resolveAction: [''],
      currentInstruStatus: [''],
      accepted: [false],
      serResolutionDate: [''],
      escalation: [''],
      requestTypeId: [''],
      subrequestTypeId: ["CRMA"],
      remarks: [''],
      delayedReasons: [''],
      isCritical: [true],
      engComments: this.formbuilder.group({
        nextDate: [''],
        comments: ['']
      }),
      assignedHistory: this.formbuilder.group({
        engineerName: [''],
        assignedDate: [''],
        ticketStatus: [''],
        comments: ['']
      }),
      engAction: this.formbuilder.group({
        engineerName: [''],
        actionTaken: [''],
        comments: [''],
        teamviewerRecroding: [''],
        actionDate: ['']
      })
    });

    this.serviceRequestService.getSerReqNo()
      .subscribe((data: any) => {
        let srno = data.data;
        this.serviceRequestform.patchValue({ "serreqno": srno });
      });
    this.listTypeItemService.getById('SERTY').pipe(first())
      .subscribe({
        next: (data: any) =>
          this.serviceRequestform.get('visitType').setValue(data.data.find(x => x.itemCode == "BRKDW")?.listTypeItemId)
      });

      this.listTypeItemService.getById('SRSAT').pipe(first())
      .subscribe({
        next: (data: any) => {
          this.serviceRequestform.get('stageId').setValue(data.data.find(x => x.itemCode == "NTSTD")?.listTypeItemId);
        },
      });

    this.listTypeItemService.getById("TRRQT").pipe(first())
      .subscribe((data: any) => {
        this.reqtypelist = data.data;
        this.serviceRequestform.get('requestTypeId').setValue(data.find(x => x.itemCode == 'CUSTR')?.listTypeItemId);
      });
    this.serviceRequestform.get('requestTime').setValue(this.datepipe.transform(Date.now(), "H:mm"))
    this.serviceRequestform.get('serReqDate').setValue(this.datepipe.transform(Date.now(), "dd/MM/YYYY"))
    this.customersiteService.getCustomerSiteByContact(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => this.SetCustomerData(data.data)
      });
    this.serviceRequestform.get('machinesNo').setValue(insId)
    this.oninstuchange(insId)

    setTimeout(() => {
      this.serviceRequest = this.serviceRequestform.value;
      this.serviceRequest.engComments = [];
      this.serviceRequest.assignedHistory = [];
      this.serviceRequest.engAction = [];
      this.serviceRequest.serResolutionDate = null;

      if (confirm("Are you sure you want to raise a critical request?")) {
        this.serviceRequestService.save(this.serviceRequest).pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.isSuccessful) {
                setTimeout(() => {
                  this.ngOnInit();
                  this.notificationService.showSuccess(data.messages[0], "Success")
                }, 1000);
              }
              else
              {  this.notificationService.showError(data.messages[0], "Error")}
            }
          })
      }
    }, 1000);

  }

  public oninstuchange(id: string) {
    this.customerDashboardService.GetSerReqInstrument(id)
      .subscribe((data: any) => {
        var instument = data.data[0];
        this.siteId = data.data[0].custSiteId;
        this.serviceRequestform.patchValue({ "machmodelName": instument.insTypeName });
        this.serviceRequestform.patchValue({ "operatorName": instument.operatorEng.firstName + '' + instument.operatorEng.lastName });
        this.serviceRequestform.patchValue({ "operatorNumber": instument.operatorEng.pContactNo });
        this.serviceRequestform.patchValue({ "operatorEmail": instument.operatorEng.pEmail });
        this.serviceRequestform.patchValue({ "machEngineer": instument.machineEng.firstName + ' ' + instument.machineEng.lastName });
        this.serviceRequestform.patchValue({ "xrayGenerator": instument.insVersion });
        this.serviceRequestform.patchValue({ "siteId": data.data[0].custSiteId });
        this.serviceRequestform.patchValue({ "assignedTo": this.emptyGuid });
      });

  }

  SetCustomerData(data: any) {
    this.logindata = data[0];
    this.serviceRequestform.patchValue({ "distId": this.logindata.distId });
    this.distId = this.logindata.distId;
    this.customerId = this.logindata.id;
    this.serviceRequestform.patchValue({ "country": this.logindata.countryId });
    this.serviceRequestform.patchValue({ "custId": this.logindata?.customerId });
    this.serviceRequestform.patchValue({ "companyName": this.logindata?.custName });

    this.serviceRequestform.patchValue({ "contactPerson": this.user.firstName + ' ' + this.user.lastName });
    this.serviceRequestform.patchValue({ "email": this.user?.email });
  }

}

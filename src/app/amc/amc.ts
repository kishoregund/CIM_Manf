import { DatePipe } from "@angular/common";
import { HttpEventType } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ColumnApi, GridApi } from "ag-grid-community";
import { Guid } from "guid-typescript";
import { first } from "rxjs/operators";
import { GetParsedDate } from "../_helpers/Providers";

import { Currency, Customer, ListTypeItem, User } from "../_models";
import { AmcInstrument } from "../_models/Amcinstrument";
import {
  AccountService,
  AlertService,
  CurrencyService,
  FileshareService,
  ListTypeService,
  NotificationService,
  ProfileService,
} from "../_services";
import { AmcinstrumentService } from "../_services/amcinstrument.service";
import { AmcstagesService } from "../_services/amcstages.service";
import { EnvService } from "../_services/env/env.service";
import { AmcInstrumentRendererComponent } from "./amc-instrument-renderer.component";
import { BrandService } from "../_services/brand.service";
import { AmcItemsService } from "../_services/amc-items.service";
import { UserDetails } from "../_newmodels/UserDetails";
import { AmcService } from "../_services/amc.service";
import { CustomerService } from "../_services/customer.service";
import { CustomerSiteService } from "../_services/customersite.service";
import { ContactService } from "../_services/contact.service";
import { InstrumentService } from "../_services/instrument.service";
import { ServiceRequestService } from "../_services/serviceRequest.service";
import { BUBrandModel } from "../_newmodels/BUBrandModel";
import { CustomerInstrumentService } from "../_services/customerinstrument.service";

@Component({
  selector: "app-Amc",
  templateUrl: "./Amc.html",
})
export class AmcComponent implements OnInit {
  form: FormGroup;
  model: any;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: any;
  user: UserDetails;

  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;
  hasCommercial: boolean = false;
  profilePermission: any;

  customersList: Customer[];
  currencyList: Currency[];
  serviceType: ListTypeItem[];
  instrumentserialno: any;
  instrumentAutoComplete: any[];
  instrumentList: AmcInstrument[] = []
  supplierList: any[];
  custSiteList: any;

  public columnDefs: any;
  private columnApi: ColumnApi;
  private api: GridApi;
  hasId: boolean = false;

  IsCustomerView: boolean = false;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;
  @ViewChild('instrumentSearch') instrumentSearch
  role: any;
  datepipe = new DatePipe('en-US')
  rowData: any;
  stagesList: any;
  processFile: any;
  isPaymentTerms: boolean = false;
  attachments: any;
  file: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  public progress: number;
  public message: string;
  @ViewChild('stageFiles') stageFiles;
  @Output() public onUploadFinished = new EventEmitter();
  vScroll: boolean = true;
  paymentTypes: any;
  payTypes: any;
  isPaymentAmt: boolean = false;
  isCompleted: boolean = false;
  isNewMode: any;
  isEditMode: any;
  isDisableSite: any;
  defaultSiteId: any;
  defaultCustomerId: any;
  baseCurrId: any;
  @ViewChild('baseAmt') baseAmt
  isOnCall: any = false;
  totalStages = 0;
  formData: any;
  ffsDateError: boolean;
  sfsDateError: boolean;
  stsDateError: boolean;
  steDateError: boolean;
  sfeDateError: boolean;
  ftsDateError: any;
  fteDateError: any;
  ffeDateError: any;
  seDateError: boolean;
  sqDateError: boolean;
  amcItems: any[] = [];
  itemStatus: any[];
  lstServiceRequest: any[] = []
  buBrandModel: BUBrandModel;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
    private Service: AmcService,
    private profileService: ProfileService,
    private customerService: CustomerService,
    private customersiteService: CustomerSiteService,
    private currencyService: CurrencyService,
    private AmcInstrumentService: AmcinstrumentService,
    private contactService: ContactService,
    private amcStagesService: AmcstagesService,
    private FileShareService: FileshareService,
    private environment: EnvService,
    private instrumentService: InstrumentService,
    private custInstrService: CustomerInstrumentService,
    private brandService: BrandService,
    private amcItemsService: AmcItemsService,
    private serviceRequestService: ServiceRequestService
  ) {

    this.form = this.formBuilder.group({
      isActive: [true],
      isMultipleBreakdown: [false],
      isDeleted: [false],
      billTo: ["", Validators.required],
      serviceQuote: ["", Validators.required],
      sqDate: ["", Validators.required],
      sDate: ["", Validators.required],
      eDate: ["", Validators.required],
      project: ["", Validators.required],
      brandId: [""],
      currencyId: [""],
      zerorate: [0],
      tnc: [""],
      custSite: ["", Validators.required],
      payterms: [''],
      paymentTerms: ["", Validators.required],
      stageName: [''],
      stageComments: [''],
      stagePaymentType: [],
      baseCurrencyAmt: [1.00, Validators.required],
      baseCurrencyId: ["", Validators.required],
      conversionAmount: [0],
      payAmt: [0],
      payAmtCurrencyId: [''],
      amcItemsForm: this.formBuilder.group({
        serviceType: [""],
        date: [""],
        estStartDate: [""],
        estEndDate: [""],
        status: [""],
        serviceRequestId: [""],
        sqNo: []
      })
    });


    this.notificationService.listen().subscribe((m: any) => {
      if (this.id != null) {
        this.AmcInstrumentService.getAmcInstrumentsByAmcId(this.id)
          .pipe(first())
          .subscribe((data: any) => {
            this.instrumentList = data.data;
          });


        this.amcStagesService.getAll(this.id).pipe(first())
          .subscribe((stageData: any) => {
            stageData.data.forEach(element => {
              element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
            });

            this.rowData = stageData.data;
            this.totalStages = this.rowData?.length | 0;
            this.form.get('stageName').reset()
            this.form.get('stageComments').reset()
            this.form.get('payterms').reset()
            this.form.get('payAmt').setValue(0)
            this.isPaymentAmt = false;
            if (this.stageFiles != null) {
              this.stageFiles.nativeElement.value = "";
            }
            var selectedfiles = document.getElementById("stageFilesList");
            selectedfiles.innerHTML = '';
          })
      }
    });
  }

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SAMC");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
        this.hasCommercial = profilePermission[0].commercial;
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
    //this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();

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

    this.id = this.route.snapshot.paramMap.get("id");
    this.isEditMode = false;

    this.form.get("sqDate").valueChanges
      .subscribe(() => this.CheckDates())

    this.form.get("eDate").valueChanges
      .subscribe(() => this.CheckDates())

    this.form.get("sDate").valueChanges
      .subscribe(() => {
        if (this.f.sDate.value != "" && this.f.sDate.value != null) {
          this.form.get("eDate").setValue(this.AddYear(this.f.sDate.value));
          this.CheckDates()
        }
      })

    this.form.get('custSite').valueChanges
      .subscribe(() => {
        this.InstrumentSearch();
        let sid = this.form.get('custSite').value;
        if (sid != null && sid != "") {
          this.customersiteService.getById(sid)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                this.form.get("paymentTerms").setValue(data.data?.payTerms);
                this.form.get("paymentTerms").disable();
              },
            });
        }
      })

    this.form.get('baseCurrencyAmt').valueChanges
      .subscribe(() => {
        let amt = (this.form.get('baseCurrencyAmt').value * this.form.get('zerorate').value);
        if (amt >= 0) {
          this.form.get('conversionAmount').setValue(amt.toFixed(2));
        }
      })

    this.form.get('zerorate').valueChanges
      .subscribe(() => {
        let amt = (this.form.get('baseCurrencyAmt').value * this.form.get('zerorate').value);
        if (amt >= 0) {
          this.form.get('conversionAmount').setValue(amt.toFixed(2));
        }
      })

    this.listTypeService.getById("AMCSG")
      .subscribe((data: any) => this.stagesList = data.data)

    this.listTypeService.getById("AISTA")
      .subscribe((data: any) => {
        this.itemStatus = data.data
        this.item.status.setValue(this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId)
      })

    this.buBrandModel = new BUBrandModel();
    this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId;
    this.buBrandModel.brandId = this.user.selectedBrandId;
    this.serviceRequestService.getAll(this.buBrandModel)
      .subscribe((data: any) => {
        this.lstServiceRequest = data.data.filter(x => x.isReportGenerated)
      });

    this.customersiteService.getCustomerSiteByContact(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (this.IsCustomerView) {
            this.form.get('billTo').setValue(data.data?.id)
            this.defaultCustomerId = data.data.id
            this.custSiteList = [];
            let siteLst = this.user.custSites?.split(",")
            data.data?.sites.forEach(element => {
              if (siteLst?.length > 0 && this.user.contactType?.toLocaleLowerCase() == "cs" && siteLst?.find(x => x == element.id) == null) return;
              this.custSiteList.push(element);
              element?.siteContacts.forEach(con => {
                if (con?.id == this.user.contactId) {
                  this.isDisableSite = true
                  if (this.id == null) this.form.get('custSite').disable()
                  this.form.get('custSite').setValue(element?.id)
                  this.defaultSiteId = element.id
                }
              });
            });
          }
        },
      });

    this.customerService.getAllByUserId(this.user.userId)//getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          debugger;
          this.customersList = data.data
        },
      })

    this.currencyService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.currencyList = data.data

          this.baseCurrId = data.data.find(x => x.code == this.environment.baseCurrencyCode)?.id
          this.form.get("baseCurrencyId").setValue(this.baseCurrId)
        },
      })


    this.listTypeService.getById("SERTY")
      .subscribe((data: any) =>
        this.serviceType = data.data?.filter(x => x.itemCode != "RENEW" && x.itemCode != "AMC"));

    this.listTypeService.getById("GPAYT")
      .pipe(first())
      .subscribe((mstData: any) => {
        // this.paymentTypes = []
        this.payTypes = mstData.data;
      });


    this.brandService.GetAll()
      .subscribe((data: any) => {
        this.supplierList = data.data;
        debugger;
        if (role != this.environment.distRoleCode) return;
        var brand = this.supplierList.find(x => x.id == this.user.selectedBrandId);
        if (!brand) return;

        //setTimeout(() => 
        this.form.get("brandId").setValue(brand.id);
        //, 1500);
      });


    // this.form.get('baseCurrencyAmt').valueChanges
    //   .subscribe(value => {
    //     if (value >= 1000) this.form.get('baseCurrencyAmt').setValue(1.0)
    //   });

    this.form.get('currencyId').valueChanges
      .subscribe(value => {
        if (this.baseAmt)
          if (value == this.form.get('baseCurrencyId').value) {
            this.form.get('baseCurrencyAmt').setValue(1.00)
            this.baseAmt.nativeElement.disabled = true
          }
      });


    this.form.get("amcItemsForm").get("serviceType").valueChanges
      .subscribe(value => {
        let isPreventive = this.serviceType?.find(x => x.listTypeItemId == value)

        if (!isPreventive || isPreventive?.itemCode != "PREV") {
          this.item.estStartDate.disable();
          this.item.estEndDate.disable();
          this.item.status.disable();
          this.item.serviceRequestId.disable();

          this.item.estStartDate.clearValidators();
          this.item.estEndDate.clearValidators();
          return;
        }

        this.item.estStartDate.enable();
        this.item.estEndDate.enable();

        this.item.estStartDate.setValidators([Validators.required]);
        this.item.estEndDate.setValidators([Validators.required]);
        this.item.estStartDate.updateValueAndValidity();
        this.item.estEndDate.updateValueAndValidity();
      })

    if (this.id != null) {
      this.amcItemsService.GetByAmcId(this.id)
        .subscribe((data: any) => {
          this.amcItems = data.data;
        })

      this.Service.getById(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.isCompleted = data.data?.isCompleted
          debugger;
          if (this.isCompleted) {
            setInterval(() => this.form.disable(), 10);
          }
          data.data.paymentTerms = data.data.paymentTerms?.split(',').filter(x => x != "");
          data.data.eDate = GetParsedDate(data.data.eDate)
          data.data.sDate = GetParsedDate(data.data.sDate)          
          this.form.get('brandId').setValue(data.data.brandId);
          this.form.get('currencyId').setValue(data.data.currencyId);
          this.amcStagesService.getAll(this.id).pipe(first())
            .subscribe((stageData: any) => {

              stageData.data?.forEach(element => {
                element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
              });

              stageData.data?.sort((a, b) => a.stageIndex - b.stageIndex);
              this.rowData = stageData.data;

              this.totalStages = this.rowData?.length | 0;
              this.GetSites(data.data.billTo);
              setTimeout(() => {
                this.formData = data.data;
                this.form.patchValue(this.formData);
                this.form.get('stageName').reset()
                this.InstrumentSearch();
                this.form.get('zerorate').setValue(this.form.get('zerorate').value.toFixed(2));
              }, 500);
            })
        });

      this.AmcInstrumentService.getAmcInstrumentsByAmcId(this.id)
        .pipe(first())
        .subscribe((data: any) => {
          this.instrumentList = data.data;
        });

      this.hasId = true;
      this.form.disable()
      this.columnDefs = this.createColumnDefsRO();
    }
    else {
      this.isNewMode = true;
      this.columnDefs = this.createColumnDefs();
      this.hasId = false;
      this.id = Guid.create();
      this.id = this.id.value;
      setTimeout(() => this.FormControlDisable(), 1000);
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

      if (this.rowData != null && this.rowData.filter(x => x.stage == this.stagesList.filter(x => x.itemCode == "CONAG")[0].listTypeItemId).length > 0) {
        this.isCompleted = true;
      }

      this.form.enable();
      this.FormControlDisable()
      this.columnDefs = this.createColumnDefs();

      let curr = this.form.get('currencyId')
      curr.setValue(curr.value)
    }
  }

  FormControlDisable() {

    this.form.get('baseCurrencyId').disable()
    this.form.get('zerorate').disable()
    this.form.get('conversionAmount').disable()
    this.form.get('paymentTerms').disable()

    if (this.isDisableSite)
      this.form.get('custSite').disable()

    if (this.IsCustomerView)
      this.form.get('billTo').disable()

    if (this.IsDistributorView)
      this.form.get("brandId").disable();

    if (this.isCompleted)
      this.form.get("isMultipleBreakdown").disable();

    this.form.get('isActive').disable();
    this.item.estStartDate.disable();
    this.item.estEndDate.disable();
    this.item.status.disable();
    this.item.serviceRequestId.disable();

    this.item.estStartDate.clearValidators();
    this.item.estEndDate.clearValidators();

  }

  Back() {
    this.router.navigate(["amclist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.hasId) {

      this.totalStages = this.rowData?.length | 0;
      this.form.get('stageName').setValue("")
      this.form.get('stageComments').setValue("")
      this.form.get('payterms').setValue("")
      this.form.get('payAmt').setValue(0)
      this.isPaymentAmt = false;
      this.form.patchValue(this.formData);

      let fileInp = <HTMLInputElement>document.getElementById("fileList")
      fileInp.value = "";
    }
    else {
      this.instrumentList = []
      this.form.reset();
    }
    this.form.disable()
    this.columnDefs = this.createColumnDefsRO();
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.Service.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess('Record deleted successfully!', "Success")
            this.router.navigate(["amclist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
          }
          else { this.notificationService.showInfo(data.messages[0], "Info"); }
        })
    }
  }

  get f() {
    return this.form.controls;
  }

  get item() {
    return (<FormGroup>this.form.get("amcItemsForm")).controls;
  }

  DisableChoseFile(className) {
    let ofer = <HTMLInputElement>document.querySelector(`input[type="file"].` + className)
    ofer.disabled = !ofer.disabled
  }


  submitStageData() {
    if (this.isPaymentTerms && !this.f.payterms.value) return this.notificationService.showInfo("Payterms is required", "Info")
    if (this.isPaymentAmt && !this.f.payAmt.value && !this.f.payAmtCurrencyId.value) return this.notificationService.showInfo("Payment Amount cannot be empty", "Info")
    if (!this.f.stageName.value) return this.notificationService.showInfo("Stage Name cannot be empty", "Info")

    if (!this.f.stageComments.value) return this.notificationService.showInfo("Comments cannot be empty", "Info")

    let hasNoAttachment = false;

    let Attachment = <HTMLInputElement>document.getElementById("stageFilesList_Attachment")
    if (Attachment) hasNoAttachment = Attachment.checked

    let comments = this.form.get('stageComments').value;

    if (!hasNoAttachment && this.processFile == null) {
      this.notificationService.showInfo("No Attachments Selected.", "Error")
      return;
    }

    this.submitted = true;
    let stage = this.form.get('stageName').value
    let index = 0;
    let paymentTerms = this.form.get('payterms').value
    let payAmt = this.form.get('payAmt').value
    let payAmtCurrencyId = this.form.get('payAmtCurrencyId').value

    if (stage == this.stagesList.filter(x => x.itemCode == "CONAG")[0].listTypeItemId && (this.amcItems == null || this.amcItems.length == 0)) {
      this.notificationService.showInfo("Please add AMC items to select Contract Agreement stage.", "Error");
      return;
    }

    let offerProcess = {
      isactive: false,
      comments,
      IsCompleted: true,
      stageIndex: this.totalStages + 1,
      amcId: this.id,
      stage,
      index,
      payAmt,
      paymentTypeId: paymentTerms,
      payAmtCurrencyId,
    }

    this.amcStagesService.save(offerProcess).pipe(first())
      .subscribe((data: any) => {
        this.submitted = false;
        if (offerProcess.stage == this.stagesList.find(x => x.itemCode == "AMPFI")?.listTypeItemId)
          this.notificationService.showInfo('Please select payment terms for Customer', "");

        if (this.processFile != null && !hasNoAttachment)
          this.uploadFile(this.processFile, data.data);

        this.processFile = null;
        this.notificationService.filter("itemadded");

        if (data.data != null) {
          data.data.forEach(element => {
            element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
          });
        }

        this.rowData = data.data
        this.totalStages = this.rowData?.length | 0;
        this.form.get("stageName").reset()
        this.form.get("stageComments").reset()
        this.form.get("stagePaymentType").reset()

        if (Attachment && hasNoAttachment) {
          this.DisableChoseFile('stageFilesList_class')
          Attachment.checked = false;
        }
      })

  }


  StageMoveUp(initialIndex) {
    var rd = this.rowData;
    var initial = rd.find(x => x.stageIndex == initialIndex);
    var beforeInitial = rd.find(x => x.stageIndex == initialIndex - 1);

    initial.stageIndex = initialIndex - 1;
    beforeInitial.stageIndex = initialIndex;
    this.rowData.sort((a, b) => a.stageIndex - b.stageIndex);
  }

  StageMoveDown(initialIndex) {
    var rd = this.rowData;
    var initial = rd.find(x => x.stageIndex == initialIndex);
    var beforeInitial = rd.find(x => x.stageIndex == initialIndex + 1);

    initial.stageIndex = initialIndex + 1;
    beforeInitial.stageIndex = initialIndex;
    this.rowData.sort((a, b) => a.stageIndex - b.stageIndex);
  }

  CheckDates() {
    let seDate = this.DateDiff(this.f.sDate.value, this.f.eDate.value);
    this.seDateError = seDate < 0;

    let sqqDateCnt = this.DateDiff(this.f.sqDate.value, new Date);
    this.sqDateError = sqqDateCnt < 0;
  }

  AddYear(sDate) {
    var d = sDate;
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year + 1, month, day - 1);
    return c;
  }

  onstageNameChanged(stage) {
    stage = this.stagesList.find(x => x.listTypeItemId == stage)?.itemCode
    this.isPaymentTerms = stage == "PYTMS";
    this.isPaymentAmt = stage == "PYRCT";
  }

  deleteProcess(id) {
    this.amcStagesService.delete(id).pipe(first())
      .subscribe((data: any) => {
        data.data.forEach(element => {
          element.createdOn = this.datepipe.transform(GetParsedDate(element.createdOn), 'dd/MM/YYYY')
        });

        this.rowData = data.data
      })
  }

  GetSites(customerId) {
    this.customerService.getById(customerId)
      .pipe(first())
      .subscribe((data: any) => {
        debugger;
        this.custSiteList = [];
        let siteLst = this.user.custSites?.split(",")
        data.data?.sites.forEach(element => {
          if (siteLst?.length > 0 && this.user.contactType?.toLocaleLowerCase() == "cs" && siteLst?.find(x => x == element.id) == null) return;
          this.custSiteList.push(element);
        })
      });
  }

  getfil(x, isParentAttachment = false) {
    isParentAttachment ? this.file = x : this.processFile = x;
  }

  listfile = (x, lstId = "selectedfiles") => {
    document.getElementById(lstId).style.display = "block";

    var selectedfiles = document.getElementById(lstId);
    var ulist = document.createElement("ul");
    ulist.id = "demo";
    ulist.style.width = "max-content"
    selectedfiles.appendChild(ulist);

    this.transaction++;
    this.hastransaction = true;

    for (let i = 0; i < x.length; i++) {
      var name = x[i]?.name;
      ulist.style.marginTop = "5px"
      var node = document.createElement("li");
      node.style.wordBreak = "break-word";
      node.style.width = "300px"
      node.appendChild(document.createTextNode(name));
      ulist.appendChild(node);
    }
  };

  uploadFile = (files, id, code = "AMC") => {
    if (files.length === 0) {
      return;
    }

    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });

    this.FileShareService.upload(formData, id, code).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.progress = Math.round((100 * event.loaded) / event.total);
        if (this.progress == 100)
          this.notificationService.filter("itemadded");
      }
      else if (event.type === HttpEventType.Response) {
        this.message = "Upload success.";
        this.onUploadFinished.emit(event.body);
      }
      this.notificationService.filter("itemadded");
    });
  }

  GetFileList(id: string) {
    this.FileShareService.list(id)
      .subscribe((data: any) => this.attachments = data.data);
  }

  RemoveInnstrument(event) {
    var cellValue = event.value;
    var rowData = event.data;
    if (this.hasDeleteAccess) {

      if (cellValue == rowData.id) {
        // if(!this.isNewMode && this.instrumentList.length == 1)
        // {
        //   return this.notificationService.showError("You cannot delete the Instrument. AMC should have minimum of 1 Instrument added.", "Error");
        // }
        var indexOfSelectedRow = this.instrumentList.indexOf(rowData);
        this.instrumentList.splice(indexOfSelectedRow, 1)
        if (rowData.amcId == null && cellValue == rowData.id) {
          this.api.setRowData(this.instrumentList)
        }
        else {
          this.AmcInstrumentService
            .delete(cellValue)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                if (data.isSuccessful) {
                  this.notificationService.showSuccess(data.messages[0], "Success");
                  const selectedData = event.api.getSelectedRows();
                  event.api.applyTransaction({ remove: selectedData });

                  let zeroRate = 0;
                  this.instrumentList.forEach(x => zeroRate += x.amount);
                  this.form.get("zerorate").setValue(zeroRate.toFixed(2));
                  //this.form.get("conversionAmount").setValue(zeroRate);
                }
              },
            });
        }
      }

    }
  }

  InstrumentSearch = () => {

    // this.buBrandModel = new BUBrandModel();
    // this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId; 
    // this.buBrandModel.brandId = this.user.selectedBrandId; 
    //this.instrumentService.getAll(this.user.userId)
    this.custInstrService.getAll(this.buBrandModel)
      .pipe(first()).subscribe((data: any) => {
        debugger;
        this.instrumentAutoComplete = data.data?.filter(x => x.custSiteId == this.f.custSite.value);
        if (this.instrumentSearch) this.instrumentSearch.value = ""
      });

  }


  AddInstrument(instrument: any) {
    if (!instrument || instrument == "")
      return this.notificationService.showError("Value Cannot be Empty. Select an option", "Error");

    if (!this.f.sDate.value || !this.f.eDate.value)
      return this.notificationService.showError("Please enter Start Date and End Date", "Invalid Dates")
    debugger;
    let datepipe = new DatePipe('en-US')
    this.model = this.form.value;
    this.model.sDate = datepipe.transform(GetParsedDate(this.model.sDate), 'dd/MM/YYYY');
    this.model.eDate = datepipe.transform(GetParsedDate(this.model.eDate), 'dd/MM/YYYY');
    this.model.instrumentIds = instrument;
    this.model.paymentTerms = ""

    this.AmcInstrumentService.InsInAMCExists(this.model)
      .subscribe((existsData: any) => {
        if (existsData.data)  /// data returns false if instrument does not exists
          return this.notificationService.showError("AMC exists for the selected Instrument for the given dates.", "");

        let d = this.instrumentAutoComplete.find(x => x.instrumentId == instrument)

        if (this.instrumentList?.find(x => x.serialNos == d.instrumentSerNoType))
          return this.notificationService.showError("Instrument already exists", "Error")
        debugger;
        var data = new AmcInstrument();
        data = {
          id: Guid.create().toString(),
          serialNos: d.serialNos,
          insTypeId: d.insType,
          insType: d.insTypeName,
          insVersion: d.insVersion,
          qty: 0,
          rate: 0,
          amount: 0,
          instrumentId: d.instrumentId,
          modified: false,
          amcId: this.id,
        };

        this.instrumentList = this.instrumentList || [];
        this.instrumentList.push(data);
        this.api.setRowData(this.instrumentList)
      })

  }

  private createColumnDefs() {
    return [{
      headerName: 'Action',
      field: 'id',
      lockPosition: "left",
      hide: this.isCompleted,
      cellRendererFramework: AmcInstrumentRendererComponent,
      cellRendererParams: {
        deleteaccess: this.hasDeleteAccess,
        list: this.instrumentList
      },

    }, {
      headerName: 'Instrument',
      field: 'insType',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'instrument',
    }, {
      headerName: 'Serial No.',
      field: 'serialNos',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Version',
      field: 'insVersion',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Qty',
      field: 'qty',
      filter: true,
      editable: (params) => { return (this.isEditMode || this.isNewMode) },
      sortable: true,
      defaultValue: 0
    },
    {
      headerName: 'Rate',
      field: 'rate',
      filter: true,
      editable: (params) => { return (this.isEditMode || this.isNewMode) },
      hide: !this.hasCommercial,
      sortable: true,
      valueFormatter: params => params.data.rate.toFixed(2),
      default: 0.00
    },
    {
      headerName: 'Amount',
      field: 'amount',
      hide: !this.hasCommercial,
      filter: true,
      editable: false,
      sortable: true,
      valueFormatter: params => params.data.amount.toFixed(2),
      default: 0.00
    }
    ]
  }

  private createColumnDefsRO() {
    return [{
      headerName: 'Instrument',
      field: 'insType',
      filter: true,
      enableSorting: true,
      editable: false,
      sortable: true,
      tooltipField: 'instrument',
    }, {
      headerName: 'Serial No.',
      field: 'serialNos',
      filter: true,
      editable: true,
      sortable: true
    },
    {
      headerName: 'Version',
      field: 'insVersion',
      filter: true,
      editable: false,
      sortable: true
    },
    {
      headerName: 'Qty',
      field: 'qty',
      filter: true,
      editable: (params) => { return (this.isEditMode || this.isNewMode) },
      sortable: true,
      defaultValue: 0
    },
    {
      headerName: 'Rate',
      field: 'rate',
      filter: true,
      editable: (params) => { return (this.isEditMode || this.isNewMode) },
      hide: !this.hasCommercial,
      valueFormatter: params => params.data.rate.toFixed(2),
      sortable: true,
      default: 0.00
    },
    {
      headerName: 'Amount',
      field: 'amount',
      hide: !this.hasCommercial,
      filter: true,
      editable: false,
      sortable: true,
      valueFormatter: params => params.data.amount.toFixed(2),
      default: 0.00
    }
    ]
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  onCellValueChanged(event) {
    var data = event.data;
    event.data.modified = true;

    if (this.instrumentList.filter(x => x.id == data.id).length > 0) {
      var d = this.instrumentList.filter(x => x.id == data.id);

      if (data.qty.toString().indexOf(".") !== -1) {
        data.qty = 0;
        this.notificationService.showInfo("Qty cannot be in decimals.", "Info");
      }
      if (data.qty < 0) {
        data.qty = 0;
        this.notificationService.showInfo("Qty cannot be less than 0.", "Info");
      }
      if (data.rate < 0) {
        data.rate = 0;
        this.notificationService.showInfo("Rate cannot be negative.", "Info");
      }

      var rowAmount = (Number(data.qty) * Number(data.rate));
      d[0].amount = rowAmount;
      d[0].rate = Number(data.rate)
      d[0].qty = Number(data.qty)
      this.api.setRowData(this.instrumentList);

      let zeroRate = 0;
      this.instrumentList.forEach(x => zeroRate += x.amount);
      this.form.get("zerorate").setValue(zeroRate.toFixed(2));
    }
  }

  DateDiff(date1, date2) {
    let dateSent = new Date((date1));//early
    let currentDate = new Date((date2));//later
    return Math.floor(
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

  }

  onSubmit() {
    this.submitted = true;
    this.form.markAllAsTouched();
    this.alertService.clear();

    // if (this.instrumentList == null || this.instrumentList.length <= 0) {
    //   return this.notificationService.showInfo("Please add at least 1 instrument!", "Info");
    // }

    var instrumentIds = "";
    if (this.instrumentList != null && this.instrumentList.length > 0) {
      this.instrumentList.forEach(instrument => {
        instrument.amcId = this.id;
        instrumentIds += instrument.instrumentId + ",";
      });
    }

    if (this.form.invalid) return;

    this.form.get('billTo').enable()
    this.model = this.form.getRawValue();
    this.form.get('billTo').disable()

    this.model.conversionAmount = parseFloat(this.form.get("conversionAmount").value);
    if (this.IsCustomerView) {
      this.model.billTo == this.defaultCustomerId
      if (!this.model.custSite) {
        this.model.custSite = this.defaultSiteId
      }
    }
    if (this.form.get('paymentTerms').value.length > 0) {
      var selectarray = this.form.get('paymentTerms').value;
      this.model.paymentTerms = selectarray.toString();
    }

    else if (this.form.get('paymentTerms').value.length == 0) {
      this.model.paymentTerms = ""
    }

    let calc = this.DateDiff(this.model.sDate, this.model.eDate)

    if (calc <= 0) {
      this.notificationService.showInfo("End Date should not be greater than Start Date", "Info");
      return;
    }

    const datepipe = new DatePipe('en-US');

    this.model.sDate = datepipe.transform(GetParsedDate(this.model.sDate), 'dd/MM/yyyy');
    this.model.eDate = datepipe.transform(GetParsedDate(this.form.get('eDate').value), 'dd/MM/yyyy');
    this.model.sqDate = datepipe.transform(GetParsedDate(this.model.sqDate), 'dd/MM/yyyy');

    this.model.baseCurrencyId = this.baseCurrId
    this.model.instrumentIds = instrumentIds;



    if (!this.hasId && this.hasAddAccess) {
      this.model.id = this.id;

      if (this.model.isMultipleBreakdown) {
        let amcItemForm = (<FormGroup>this.form.get("amcItemsForm"))
        let amcItem = amcItemForm.getRawValue();

        amcItem.serviceType = this.serviceType.find(x => x.itemCode == "BRKDW")?.listTypeItemId
        amcItem.status = this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId
        amcItem.amcId = this.id;
        amcItem.sqNo = this.amcItems.length + 1;
        this.amcItems.push(amcItem);
      }

      this.model.zerorate = this.model.zerorate != "" ? parseFloat(this.model.zerorate) : 0.00;
      this.Service.save(this.model)
        .pipe(first())
        .subscribe({
          next: (data: any) => {

            if (!data.isSuccessful) { return this.notificationService.showError(data.messages[0], "Error"); }
            else {
              this.notificationService.showSuccess(data.messages[0], "Success");

              if ((this.amcItems == null || this.amcItems.length <= 0) &&
                (this.instrumentList == null || this.instrumentList.length <= 0))
                this.router.navigate(["amclist"], {
                  queryParams: { isNSNav: true },
                });


              if (this.amcItems != null && this.amcItems.length > 0) {
                this.amcItems.forEach(x => {
                  x.amcId = this.id;
                  this.amcItemsService.SaveItem(x)
                    .subscribe((data: any) => {
                      if (!data || !data.isSuccessful) return this.notificationService.showError(data.messages[0], "Error");
                    })
                });
                this.amcItems = [];
              }


              if (this.instrumentList != null && this.instrumentList.length > 0) {
                this.AmcInstrumentService.SaveAmcInstruments(this.instrumentList)
                  .subscribe((data: any) => {
                    if (!data.isSuccessful) return this.notificationService.showError(data.messages[0], "Error");

                    this.notificationService.showSuccess(data.messages[0], "Success");
                    this.router.navigate(["amclist"], {
                      queryParams: { isNSNav: true },
                    });
                  });
              }
            }
          },
        });
    }
    else if (this.hasUpdateAccess) {
      this.model.id = this.id;
      this.model.zerorate = this.model.zerorate != "" ? parseFloat(this.model.zerorate) : 0.00;
      this.Service.update(this.id, this.model)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.rowData?.forEach((x) => {
                x.createdOn = new Date()
                this.amcStagesService.update(x).subscribe();
              })

              this.notificationService.showSuccess(data.messages[0], "Success");
              if (this.instrumentList == null || this.instrumentList.length <= 0) {
                this.router.navigate(["amclist"], {
                  //relativeTo: this.activeRoute,
                  queryParams: { isNSNav: true },
                  //queryParamsHandling: 'merge'
                });
              }
              if (this.instrumentList != null && this.instrumentList.length > 0) {
                this.AmcInstrumentService.SaveAmcInstruments(this.instrumentList)
                  .pipe(first()).subscribe({
                    next: (data: any) => {
                      this.router.navigate(["amclist"], {
                        //relativeTo: this.activeRoute,
                        queryParams: { isNSNav: true },
                        //queryParamsHandling: 'merge'
                      });
                    },
                  });
              }

              if (this.model.isMultipleBreakdown &&
                this.amcItems.filter(x => x.serviceType == this.serviceType.find(x => x.itemCode == "BRKDW")?.listTypeItemId).length == 0) {
                this.amcItems = [];
                let amcItemForm = (<FormGroup>this.form.get("amcItemsForm"))
                let amcItem = amcItemForm.getRawValue();

                amcItem.serviceType = this.serviceType.find(x => x.itemCode == "BRKDW")?.listTypeItemId
                amcItem.status = this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId
                amcItem.amcId = this.id;
                amcItem.sqNo = this.amcItems.length + 1;
                this.amcItems.push(amcItem);

                this.amcItemsService.SaveItem(amcItem)
                  .subscribe((data: any) => {
                    if (!data || !data.isSuccessful) return this.notificationService.showError(data.messages[0], "Error");
                  })
              }
            }
            else this.notificationService.showError(data.messages[0], "Error");
          }

        });
    }
  }

  onItemAdd() {
    let amcItemForm = (<FormGroup>this.form.get("amcItemsForm"))
    let amcItem = amcItemForm.getRawValue();
    if (amcItemForm.invalid || !amcItem.serviceType) {
      return this.notificationService.showInfo("All fields are required!", "Invalid Fields")
    }

    let isMultiBreakdown = this.form.get("isMultipleBreakdown").value;
    if (this.amcItems.length > 0 && this.amcItems.filter(x => x.serviceType == this.serviceType.find(x => x.itemCode == "BRKDW").listTypeItemId).length > 0
      && this.serviceType.find(x => x.itemCode == "BRKDW").listTypeItemId == amcItem.serviceType && isMultiBreakdown) {
      return this.notificationService.showInfo("For Multiple Breakdown only one Breakdown Amc item is required.", "Info")
    }

    amcItem.status = this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId
    amcItem.amcId = this.id;
    if (amcItem.estEndDate < amcItem.estStartDate) return this.notificationService.showInfo("Est. End Date should not be before Est. Start Date", "Invalid Date");

    amcItem.estEndDate = this.datepipe.transform(amcItem.estEndDate, 'yyyy-MM-dd')
    amcItem.estStartDate = this.datepipe.transform(amcItem.estStartDate, 'yyyy-MM-dd')

    let stDate = this.datepipe.transform(this.form.get('sDate').value, 'yyyy-MM-dd');
    let edDate = this.datepipe.transform(this.form.get('eDate').value, 'yyyy-MM-dd');

    if (amcItem.estStartDate < stDate) {
      return this.notificationService.showInfo("Est. Start date should be within the AMC Start and End Dates.", "Invalid Date");
    }
    if (amcItem.estStartDate > edDate) { return this.notificationService.showInfo("Est. Start date should be within the AMC Start and End Dates.", "Invalid Date"); }
    if (amcItem.estEndDate < stDate) { return this.notificationService.showInfo("Est. End date should be within the AMC Start and End Dates.", "Invalid Date"); }
    if (amcItem.estEndDate > edDate) { return this.notificationService.showInfo("Est. End date should be within the AMC Start and End Dates.", "Invalid Date"); }


    amcItem.estEndDate = this.datepipe.transform(amcItem.estEndDate, "dd/MM/YYYY")
    amcItem.estStartDate = this.datepipe.transform(amcItem.estStartDate, "dd/MM/YYYY")

    amcItem.sqNo = this.amcItems.length + 1;

    if (!this.hasId) {
      this.amcItems.push(amcItem);
      this.form.get("amcItemsForm").reset();
      this.item.status.setValue(this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId)
      return;
    }

    this.amcItemsService.SaveItem(amcItem)
      .subscribe((data: any) => {
        if (!data || !data.isSuccessful) return this.notificationService.showError(data.messages[0], "Error");

        //this.amcItems.push(amcItem);
        this.getAMCItems();
        this.form.get("amcItemsForm").reset();
        this.item.status.setValue(this.itemStatus.find(x => x.itemCode == "AINCO")?.listTypeItemId)
      })
  }

  DeleteItem(item) {

    if (this.form.get("isMultipleBreakdown").value && item.serviceType == this.serviceType.find(x => x.itemCode == "BRKDW")?.listTypeItemId) {
      return this.notificationService.showInfo("Breakdown cannot be deleted as Multiple Breakdowns option is selected for this AMC", "Info");
    }
    else {
      this.amcItemsService.DeleteItem(item.id)
        .subscribe((data: any) => {
          if (data && data.isSuccessful) {
            this.notificationService.showSuccess("Item Deleted Successfully", "Success");
            //this.amcItems = this.amcItems.filter(x => x.id != id);

            this.getAMCItems();

          }
          else this.notificationService.showError("Some Error Occurred", "Error");
        });
    }
  }

  getAMCItems() {
    this.amcItemsService.GetByAmcId(this.id)
      .subscribe((data: any) => {
        debugger;
        this.amcItems = data.data;
      });
  }

  getServiceType(id) {
    if (this.serviceType != null && this.serviceType.length > 0) {
      return this.serviceType.find(x => x.listTypeItemId == id)?.itemName;
    }
    else
      return "";
  }

  getStatus(id) {
    if (this.itemStatus != null && this.itemStatus.length > 0) {
      return this.itemStatus.find(x => x.listTypeItemId == id)?.itemName;
    }
  }

  getServiceRequest(id) {
    return this.lstServiceRequest.find(x => x.id == id)?.serReqNo;
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import {
  ConfigTypeValue,
  Contact,
  CustomerSite,
  Distributor,
  FileShare,
  Instrument,
  InstrumentConfig,
  ListTypeItem,
  ProfileReadOnly,
  SparePart,
  User
} from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import * as $ from 'jquery'

import {
  AccountService,
  AlertService,
  ConfigTypeValueService,
  CurrencyService,
  FileshareService,
  ListTypeService,
  NotificationService,
  ProfileService,
  SparePartService,
  UploadService
} from '../_services';
import { DomSanitizer } from "@angular/platform-browser";
import { DatePipe } from "@angular/common";
import { EnvService } from '../_services/env/env.service';
import { BusinessUnitService } from '../_services/businessunit.service';
import { BrandService } from '../_services/brand.service';
import { GetParsedDate } from '../_helpers/Providers';
import { Accessories } from './Accessories.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { InstrumentAccessoryService } from '../_services/InstrumentAccessory.Service';
import { parseHostBindings } from '@angular/compiler';
import { UserDetails } from '../_newmodels/UserDetails';
import { InstrumentService } from '../_services/instrument.service';
import { FilerendercomponentComponent } from './filerendercomponent.component';
import { ManufacturerService } from '../_services/manufacturer.service';

@Component({
  selector: 'app-instrument',
  templateUrl: './instrument.html',
})
export class InstrumentComponent implements OnInit {
  user: UserDetails;
  instrumentform: FormGroup;
  instrument: Instrument;
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  code: string = "CONTY";
  listTypeItems: ListTypeItem[];
  config: InstrumentConfig;
  sparePartsList: SparePart[] = [];
  sparePartDetails: SparePart[] = [];
  recomandedFilter: SparePart[] = [];
  consumfilter: SparePart[] = [];
  fullsparefilter: SparePart[] = [];
  othersparefilter: SparePart[] = [];
  configValueList: ConfigTypeValue[];
  selectedConfigType: ConfigTypeValue[] = [];
  engList: Contact[];
  imagePath: any;
  pdfPath: any;
  pdfFileName: string;
  instuType: ListTypeItem[];
  contactList: Contact[];
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasCommercial: boolean = false;
  noimageData: any = "data:image/jpeg;base64,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";
  public columnDefs: any[];
  public columnAllSparesDefs: any[];
  private columnApi: ColumnApi;
  private api: GridApi;
  private allsparesapi: GridApi;
  PdffileData: FileShare[];
  pdfBase64: string;
  public pdfcolumnDefs: any[];
  private pdfcolumnApi: ColumnApi;
  private pdfapi: GridApi;

  lstCurrency: any[]
  file: any;
  img: any
  attachments: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  datepipie = new DatePipe("en-US");
  isEditMode;
  isNewMode: boolean;
  siteId: any;
  hasWarrenty: boolean;
  @ViewChild('baseAmt') baseAmt: any
  baseCurrId: any;
  businessUnitList: any[]
  brandList: any[];
  isAccessories: any;
  bsActionModalRef: BsModalRef;
  accessoriesData: any;
  formData: any;
  role: any;
  manfList: any;
  purchaseDateGreaterThanManudate: boolean;
  shipmentDateGreaterThanManudate: boolean;
  shipmentDateGreaterThanPurchaseDate: boolean;
  instrumentInsDateGreaterThanManufacturingDate: boolean;
  instrumentInsDateGreaterThanPurchaseDate: boolean;
  instrumentInsDateGreaterThanShipmentDate: boolean;
  warrantyStartDateGreaterThanInstallationDate: boolean;


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private instrumentService: InstrumentService,
    private listTypeService: ListTypeService,
    private sparePartService: SparePartService,
    private uploadService: UploadService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private configService: ConfigTypeValueService,
    private fileshareService: FileshareService,
    private currencyService: CurrencyService,
    private _sanitizer: DomSanitizer,
    private businessUnitService: BusinessUnitService,
    private enviroment: EnvService,
    private modalService: BsModalService,
    private brandService: BrandService,
    private instrumentAccessoryService: InstrumentAccessoryService,
    private manfService: ManufacturerService
  ) {
    notificationService.listen().subscribe((data) => {
      this.instrumentAccessoryService.GetByInsId(this.id)
        .subscribe((data: any) => this.accessoriesData = data.data)
    })


    this.instrumentform = this.formBuilder.group({
      serialNos: ['', Validators.required],
      insMfgDt: ['', Validators.required],
      insType: ['', [Validators.required]],
      insVersion: ['', Validators.required],
      image: [''],
      isActive: true,
      isDeleted: [false],
      configTypeId: [''],
      configValueId: [''],
      // cost: [0],
      // currencyId: [""],
      // baseCurrencyAmt: [1.00, Validators.required],
      // baseCurrencyId: ["", Validators.required],
      manufId: ['', Validators.required],
      businessUnitId: ["", Validators.required],
      brandId: ["", Validators.required],
    });

    this.isAccessories = false;
  }

  ngOnInit() {
    this.transaction = 0;
    this.user = this.accountService.userValue;

    let role = JSON.parse(sessionStorage.getItem('segments'));
    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SINST");
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
      //this.notificationService.RestrictAdmin() -- this is master screen
      //return;
    }
    else {
      this.role = role[0]?.itemCode;
    }

    this.imageUrl = this.noimageData;

    this.id = this.route.snapshot.paramMap.get('id');


    this.listTypeService.getById("INSTY").pipe(first())
      .subscribe((data: any) => this.instuType = data.data);

    this.listTypeService.getById(this.code).pipe(first())
      .subscribe((data: any) => this.listTypeItems = data.data);

    this.manfService.getAll()
      .subscribe((data: any) => this.manfList = data.data);

    // this.instrumentform.get('baseCurrencyAmt').valueChanges
    //   .subscribe(value => {
    //     if (value >= 100000) this.instrumentform.get('baseCurrencyAmt').setValue(1.0)
    //   });

    // this.instrumentform.get('currencyId').valueChanges
    //   .subscribe(value => {
    //     if (this.baseAmt == null || this.baseAmt == undefined || this.baseAmt.nativeElement == null || this.baseAmt.nativeElement == undefined) return;
    //     if (value == this.instrumentform.get('baseCurrencyId').value) {
    //       this.instrumentform.get('baseCurrencyAmt').setValue(1.00)
    //       this.baseAmt.nativeElement.disabled = true
    //     }
    //     else this.baseAmt.nativeElement.disabled = false
    //   });

    // if (this.hasCommercial)
    //   this.instrumentform.get("cost").setValidators([Validators.required])
    // else this.instrumentform.get("cost").clearValidators()

    // if (this.hasCommercial)
    //   this.instrumentform.get("currencyId").setValidators([Validators.required])
    // else this.instrumentform.get("currencyId").clearValidators()

    // this.currencyService.getAll()
    //   .pipe(first()).subscribe((data: any) => {
    //     this.lstCurrency = data.data
    //     this.baseCurrId = data.data.find(x => x.code == this.enviroment.baseCurrencyCode)?.id
    //     this.instrumentform.get("baseCurrencyId").setValue(this.baseCurrId)
    //   })


    this.businessUnitService.GetAll()
      .pipe(first()).subscribe((data: any) => {
        this.businessUnitList = data.data;
        debugger;
        var businessUnit = this.businessUnitList?.find(x => x.id == this.user.selectedBusinessUnitId);
        if (this.role != this.enviroment.distRoleCode || !businessUnit) return;

        this.instrumentform.get("businessUnitId").setValue(businessUnit.id)
      })

    this.instrumentform.get("businessUnitId").valueChanges
      .subscribe((value: any) => {
        if (value != "") {
          this.brandService.GetByBU(value)
            .pipe(first()).subscribe((data: any) => {
              var brandLst = []
              this.user.brandIds?.split(',').forEach(e => {
                if (data.data && data.data.length > 0) {
                  var obj = data.data.find(x => x.id == e);
                  if (obj) brandLst.push(obj);
                }
              });
              this.brandList = brandLst;

              setTimeout(() => {
                var brand = this.brandList.find(x => x.id == this.user.selectedBrandId);
                if (brand && this.role == this.enviroment.distRoleCode) this.instrumentform.get("brandId").setValue(brand.id)
              }, 300);

            })
        }
      })

    if (this.id != null) {

      this.instrumentAccessoryService.GetByInsId(this.id).subscribe((data: any) => {
        this.accessoriesData = data.data;
      });

      this.instrumentService.getById(this.id)
        .pipe(first()).subscribe((data: any) => {

          debugger;
          if (data.data.image == "" || data.data.image == null) {
            this.imageUrl = this.noimageData;
          }
          else {            
              //this.imageUrl = "data:image/jpeg;base64, " + data.data.image;
              this.imageUrl = data.data.image;
            //this.imageUrl = this._sanitizer.bypassSecurityTrustResourceUrl(this.imageUrl)
          }

          this.fileshareService.list(data.data.id)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                this.attachments = data.data;
              },
            });

          //this.hasWarrenty = data.data.warranty
          setTimeout(() => {
            this.formData = data.data;
            this.instrumentform.patchValue(this.formData);
            //debugger;
            // let costVal = this.instrumentform.get('cost').value;
            // let baseCurAmt = this.instrumentform.get('baseCurrencyAmt').value;
            // this.instrumentform.get('baseCurrencyAmt').setValue(baseCurAmt.toFixed(2));
            // this.instrumentform.get('cost').setValue(costVal.toFixed(2));
          }, 700);

          this.sparePartDetails = data.data.spares;
          debugger;
          this.recomandFilter();
          for (let i = 0; i < data.data.spares.length; i++) {

            if (this.selectedConfigType.filter(x =>
              //x.id == data.data.spares[i].configValueId
              x.listTypeItemId == data.data.spares[i].configTypeId
              && x.sparePartId == data.data.spares[i].id).length == 0
            ) {
              let cnfig: ConfigTypeValue;
              cnfig = new ConfigTypeValue;
              //cnfig.id = data.data.spares[i].configValueId;
              cnfig.listTypeItemId = data.data.spares[i].configTypeId;
              cnfig.sparePartId = data.data.spares[i].id;
              cnfig.insqty = "1"; //data.data.spares[i].insQty;
              this.selectedConfigType.push(cnfig);
            }
          }
        });


      // this.fileshareService.getById(this.id).pipe(first())
      //   .subscribe({
      //     next: (data: any) =>
      //       this.PdffileData = data.data
      //   });
      setTimeout(() => this.instrumentform.disable(), 1000);
      this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();
      this.columnDefs = this.createColumnDefsRO();

    }
    else {
      this.isNewMode = true
      setTimeout(() => this.FormControlDisable(), 1000);
      this.pdfcolumnDefs = this.pdfcreateColumnDefs();
      this.columnDefs = this.createColumnDefs();
      //   let costVal = this.instrumentform.get('cost').value;
      // let baseCurAmt = this.instrumentform.get('baseCurrencyAmt').value;
      // this.instrumentform.get('baseCurrencyAmt').setValue(baseCurAmt.toFixed(2));
      // this.instrumentform.get('cost').setValue(costVal.toFixed(2));
    }

  }

  ChangeTab(val) {

    this.isAccessories = false;
    if (val == "accessory") {
      this.isAccessories = true;
      if (this.isEditMode) {
        this.columnDefs = this.createColumnDefsAccessory();
      }
      else this.columnDefs = this.createColumnDefsAccessoryRO();
    }
    else if (val == "all" && (this.isEditMode || this.isNewMode)) {
      this.LoadAllSpares();
      this.columnAllSparesDefs = this.createColumnAllSparesDefs();
    }
    // if (this.isAccessories)
    //   if (this.isEditMode)
    //     this.columnDefs = this.createColumnDefsAccessory();
    //   else this.columnDefs = this.createColumnDefsAccessoryRO();
    else
      if (this.isEditMode) {
        this.columnDefs = this.createColumnDefs();
      }
      else this.columnDefs = this.createColumnDefsRO();

  }

  LoadAllSpares() {
    if (this.sparePartsList.length == 0) {
      this.sparePartService.getAll().pipe(first())
        .subscribe((data: any) => this.sparePartsList = data.data);
    }
  }

  openAccessoryModel() {
    if (this.isAccessories == true) {
      const modalOptions: any = {
        backdrop: 'static',
        ignoreBackdropClick: true,
        keyboard: false,
        initialState: {
          instrumentId: this.id
        },
      }
      if (this.id != null)
        this.bsActionModalRef = this.modalService.show(Accessories, modalOptions);
      else this.notificationService.showInfo("Please save the Instrument to add Accessory.", "Info")
    }
  }
  DeleteInstrumentAccessory(event) {
    var data = event.data;
    event.data.modified = true;
    this.instrumentAccessoryService.delete(data.id)
      .subscribe((data) => this.notificationService.filter("itemadded"))

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

      this.instrumentform.enable();
      this.FormControlDisable();
      this.pdfcolumnDefs = this.pdfcreateColumnDefs();

      if (!this.isAccessories)
        this.columnDefs = this.createColumnDefs();
      else this.columnDefs = this.createColumnDefsAccessory();

      // let curr = this.instrumentform.get('currencyId')
      // curr.setValue(curr.value)
    }
  }

  Back() {

    this.router.navigate(["instrumentlist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.instrumentform.patchValue(this.formData);
    else this.instrumentform.reset();
    this.instrumentform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.pdfcolumnDefs = this.pdfcreateColumnDefsRO();
    this.columnDefs = this.createColumnDefsRO();
    this.notificationService.SetNavParam();
    this.contactList = []
  }

  FormControlDisable() {

    // this.instrumentform.get('baseCurrencyId').disable()
    // this.instrumentform.get('baseCurrencyId').disable()

    if (this.role == this.enviroment.distRoleCode) {
      this.instrumentform.get('businessUnitId').disable()
      this.instrumentform.get('brandId').disable()
    }
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.instrumentService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Record deleted successfully", "Success");
            this.router.navigate(["instrumentlist"], {
              queryParams: {
                isNSNav: true
              }
            })
          }
          else
            this.notificationService.showInfo(data.messages[0], "Info");
        })
    }
  }


  @ViewChild('fileInput') el: ElementRef;
  imageUrl: any; //= 'https://i.pinimg.com/236x/d6/27/d9/d627d9cda385317de4812a4f7bd922e9--man--iron-man.jpg';
  editFile: boolean = true;
  removeUpload: boolean = false;

  // convenience getter for easy access to form fields
  get f() {
    return this.instrumentform.controls;
  }

  get c() {
    return this.instrumentform.controls.configuration;
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
      node.appendChild(document.createTextNode(name));
      ul.appendChild(node);
    }
  };


  getPdffile(filePath: string) {
    //debugger;
    if (filePath != null && filePath != "") {
      this.uploadService.getFile(filePath)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //debugger;
            this.download(data.data);
            // this.alertService.success('File Upload Successfully.');
            // this.imagePath = data.path;

          },
          error: error => {

            // this.imageUrl = this.noimageData;
          }
        });
    }
  }

  download(fileData: any) {
    //debugger;
    const byteArray = new Uint8Array(atob(fileData).split('').map(char => char.charCodeAt(0)));
    let b = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(b);
    window.open(url);
    // i.e. display the PDF content via iframe
    // document.querySelector("iframe").src = url;
  }

  getInstrBySerialNo(serialNo: string) {
    //debugger;     

    this.instrumentService.searchByKeyword(serialNo) //, this.instrumentform.get('custSiteId').value)
      .pipe(first()).subscribe((data: any) => {
        data = data.data;

        this.formData = data;
        this.instrumentform.patchValue(this.formData);
        this.sparePartDetails = data?.spares;
        this.recomandFilter();
        for (let i = 0; i < data.spares.length; i++) {
          if (this.selectedConfigType?.filter(x => x.listTypeItemId == data.spares[i].configTypeid
            && x.sparePartId == data.spares[i].id).length == 0) {
            let cnfig: ConfigTypeValue;
            cnfig = new ConfigTypeValue;
            //cnfig.id = data.spares[i].configValueId;
            cnfig.listTypeItemId = data.spares[i].configTypeId;
            cnfig.sparePartId = data.spares[i].id;
            cnfig.insqty = "1"; //data.spares[i].insQty;
            this.selectedConfigType.push(cnfig);
          }
        }
      });
  }

  onDropdownChange(value: string){ //, configvalue: string) {
    if (!value)// || !configvalue || configvalue == "0")
      return this.notificationService.showInfo("Please select Config Type", "Info");

    if (this.selectedConfigType.length > 0 && this.selectedConfigType.filter(x => x.listTypeItemId == value && x.listTypeItemId == value).length == 0) {
      this.sparePartService.getByConfignValueId(value)
        .pipe(first()).subscribe((data: any) => {
          if (data.data.length > 0) {
            this.sparePartDetails = this.sparePartDetails.concat(data.data);
            this.recomandFilter();
            for (let i = 0; i < data.data.length; i++) {
              // let cnfig: InstrumentConfig;
              // cnfig = new InstrumentConfig;
              // cnfig.configValueId = configvalue;
              // cnfig.configTypeId = value;
              // cnfig.sparepartIdId = data.data[i].id;
              //this.selectedConfigType.push(cnfig);

              let cnfig: ConfigTypeValue;
              cnfig = new ConfigTypeValue;
              //cnfig.id = configvalue;
              cnfig.listTypeItemId = value;
              cnfig.sparePartId = data.data[i].id;
              this.selectedConfigType.push(cnfig);
            }
            this.notificationService.showInfo("Spare Parts Added", "Parts Added")
            this.instrumentform.get("configTypeId").reset();
            //this.instrumentform.get("configValueId").reset();
          }
        });
    }
    else {
      if (this.selectedConfigType.filter(x => x.listTypeItemId == value).length == 0) {
        this.sparePartService.getByConfignValueId(value)
          .pipe(first()).subscribe((data: any) => {
            if (data.data.length > 0) {
              if (this.sparePartDetails != null) {
                this.sparePartDetails = this.sparePartDetails.concat(data.data);
                this.recomandFilter();
              }
              else {
                this.sparePartDetails = data.data;
                this.recomandFilter();
              }
              for (let i = 0; i < data.data.length; i++) {
                let cnfig: ConfigTypeValue;
                cnfig = new ConfigTypeValue;
                //cnfig.id = configvalue;
                cnfig.listTypeItemId = value;
                cnfig.sparePartId = data.data[i].id;
                this.selectedConfigType.push(cnfig);
              }
              this.notificationService.showInfo("Spare Parts Added", "Parts Added")
              this.instrumentform.get("configTypeId").reset();
              //this.instrumentform.get("configValueId").reset();
            }
          });
      }
    }
  }

  uploadFile(files, id) {
    //debugger;
    this.img = files;
    debugger;
    let reader = new FileReader(); // HTML5 FileReader API
    let file = files[0];
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result as string;
      this.instrumentform.patchValue({
        imageUrl: reader.result as string
      });
    }

    // if (files.length === 0 || id == null) {
    //   return;
    // }
    // let filesToUpload: File[] = files;
    // const formData = new FormData();
    // Array.from(filesToUpload).map((file, index) => {
    //   return formData.append("file" + index, file, file.name);
    // });
    // this.fileshareService.upload(formData, id, "INSTIMG", "INST").subscribe((event) => { });
  }

  uploadPdfFile(event) {
    //debugger;
    let file = event.target.files;
    if (event.target.files && event.target.files[0]) {
      this.uploadService.uploadPdf(file)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.notificationService.showSuccess("File Upload Successfully", "Success");
            this.pdfPath = data.path;
          }
        });
    }
  }

  saveFileShare(files, id) {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.fileshareService.upload(formData, id, "INST").subscribe((event) => { });
  }

  getfil(x) {
    this.file = x;
  }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();
    this.instrumentform.markAllAsTouched();

    this.isSave = true;
    this.loading = true;
    this.instrumentform.enable();
    this.instrument = this.instrumentform.value;
    this.FormControlDisable();
    this.instrument.image = this.imageUrl;
    this.instrument.spares = [];
    //this.instrument.baseCurrencyId = this.baseCurrId

    for (let i = 0; i < this.selectedConfigType.length; i++) {
      this.config = new InstrumentConfig();
      this.config.configTypeId = this.selectedConfigType[i].listTypeItemId;
      //this.config.configValueId = this.selectedConfigType[i].id;
      this.config.sparepartId = this.selectedConfigType[i].sparePartId;
      if (this.selectedConfigType[i].insqty != null) {
        this.config.insQty = parseInt(this.selectedConfigType[i].insqty);
      }
      else {
        this.config.insQty = 0;
      }

      this.instrument.spares.push(this.config);
    }
    // this.instrument.cost = this.instrument.cost != ""? parseFloat(this.instrument.cost):0.00;
    // this.instrument.baseCurrencyAmt = this.instrument.baseCurrencyAmt != ""? parseFloat(this.instrument.baseCurrencyAmt):0.00;
    debugger;
    if (this.id == null) {
      this.instrumentService.save(this.instrument)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.router.navigate(["instrumentlist"], {
                queryParams: {
                  isNSNav: true
                }
              });
              if (this.file != null) {
                this.saveFileShare(this.file, data.data.id)
              }
              // not needed as choose converts to base64
              //if (this.img != null && this.img != "") this.uploadFile(this.img, this.id) 
            }
            else this.notificationService.showError(data.messages[0], "Error")

            this.loading = false;
          },
        });
    }
    else {
      debugger;
      this.instrument.id = this.id;
      this.instrumentService.update(this.id, this.instrument)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              if (this.file != null) {
                this.saveFileShare(this.file, this.id)
              }
              //if (this.img != null && this.img != "") this.uploadFile(this.img, this.id)

              this.notificationService.showSuccess(data.messages[0], "Success");
              this.router.navigate(["instrumentlist"], {
                queryParams: {
                  isNSNav: true
                }
              });
            }

            else this.notificationService.showError(data.messages[0], "Error")

            this.loading = false;

          },
        });
    }
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'configTypeId',
        filter: false,
        enableSorting: false,
        editable: false,
        width: 100,
        sortable: false,
        lockPosition: "left",
        cellRenderer: (params) => {
          if (this.hasDeleteAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          }
        }
      },
      {
        headerName: 'Type',
        field: 'configTypeName',
        filter: false,
        resizable: true,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'configTypeName',
      },
      // {
      //   headerName: 'Type',
      //   field: 'configValueId',
      //   filter: false,
      //   enableSorting: false,
      //   editable: false,
      //   resizable: true,
      //   sortable: false,
      //   width: 0,
      //   hide: true,
      // },
      // {
      //   headerName: 'Value',
      //   field: 'configValueName',
      //   resizable: true,
      //   filter: false,
      //   enableSorting: false,
      //   editable: false,
      //   sortable: false,
      //   width: 100,
      //   tooltipField: 'configValueName',
      // },
      {
        headerName: 'Part Number',
        field: 'partNo',
        filter: true,
        resizable: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'partNo',
      }, {
        headerName: 'Description',
        field: 'itemDesc',
        filter: true,
        resizable: true,
        editable: false,
        sortable: true,
        tooltipField: 'itemDesc',
      },
      {
        headerName: 'Sparepart Qty.',
        field: 'qty',
        filter: true,
        editable: false,
        sortable: true
      },
      // {
      //   headerName: 'Instrument Qty.',
      //   field: 'insQty',
      //   filter: true,
      //   editable: true,
      //   sortable: true
      // },
      {
        headerName: 'Desc. As Per Catlog',
        field: 'descCatalogue',
        resizable: true,
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'descCatalogue',
      }
    ]
  }

  private createColumnDefsAccessory() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        width: 100,
        sortable: false,
        lockPosition: "left",
        cellRenderer: (params) => {
          if (this.hasDeleteAccess) {
            return `<button class="btn btn-link" type="button" (click)="delete(params)"><i class="fas fa-trash-alt" data-action-type="remove" title="Delete"></i></button>`
          }
        }
      },
      {
        headerName: 'Accessory Name',
        field: 'accessoryName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'accessoryName',
      },
      {
        headerName: 'Brand Name',
        field: 'brandName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'brandName',
      },
      {
        headerName: 'Model Name',
        field: 'modelName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'modelName',
      },
      {
        headerName: 'Model Number',
        field: 'modelNumber',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'modelNumber',
      },
      {
        headerName: 'Serial Number',
        field: 'serialNumber',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'serialNumber',
      },
      {
        headerName: 'Year Of Purchase',
        field: 'yearOfPurchase',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'yearOfPurchase',
      },
      {
        headerName: 'Quantity',
        field: 'quantity',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'quantity',
      },
      {
        headerName: 'Accessory Description',
        field: 'accessoryDescription',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'accessoryDescription',
      },
    ]
  }

  private createColumnDefsAccessoryRO() {
    return [
      {
        headerName: 'Accessory Name',
        field: 'accessoryName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'accessoryName',
      },
      {
        headerName: 'Brand Name',
        field: 'brandName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'brandName',
      },
      {
        headerName: 'Model Name',
        field: 'modelName',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'modelName',
      },
      {
        headerName: 'Model Number',
        field: 'modelNumber',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'modelNumber',
      },
      {
        headerName: 'Serial Number',
        field: 'serialNumber',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'serialNumber',
      },
      {
        headerName: 'Year Of Purchase',
        field: 'yearOfPurchase',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'yearOfPurchase',
      },
      {
        headerName: 'Quantity',
        field: 'quantity',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'quantity',
      },
      {
        headerName: 'Accessory Description',
        field: 'accessoryDescription',
        filter: true,
        sortable: true,
        resizable: true,
        tooltipField: 'accessoryDescription',
      },
    ]
  }

  private createColumnDefsRO() {
    return [
      {
        headerName: 'Type',
        field: 'configTypeName',
        filter: false,
        enableSorting: false,
        resizable: true,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'configTypeName',
      },
      // {
      //   headerName: 'Type',
      //   field: 'configValueId',
      //   filter: false,
      //   resizable: true,
      //   enableSorting: false,
      //   editable: false,
      //   sortable: false,
      //   width: 0,
      //   hide: true,
      // },
      // {
      //   headerName: 'Value',
      //   field: 'configValueName',
      //   resizable: true,
      //   filter: false,
      //   enableSorting: false,
      //   editable: false,
      //   sortable: false,
      //   width: 100,
      //   tooltipField: 'configValueName',
      // },
      {
        headerName: 'Part Number',
        field: 'partNo',
        resizable: true,
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'partNo',
      }, {
        headerName: 'Description',
        resizable: true,
        field: 'itemDesc',
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'itemDesc',
      },
      {
        headerName: 'Sparepart Qty.',
        field: 'qty',
        filter: true,
        editable: false,

        sortable: true
      },
      // {
      //   headerName: 'Instrument Qty.',
      //   field: 'insQty',
      //   filter: true,
      //   editable: true,
      //   sortable: true
      // },
      {
        headerName: 'Desc. As Per Catlog',
        field: 'descCatalogue',
        filter: true,
        resizable: true,
        editable: false,
        sortable: true,
        tooltipField: 'descCatalogue',
      }
    ]
  }

  private createColumnAllSparesDefs() {
    return [
      // {
      //   headerName: 'Action',
      //   field: 'id',

      //   // filter: false,        
      //   // enableSorting: false,
      //   // editable: false,
      //   // width: 100,
      //   // sortable: false,  
      //   // lockPosition: "left",
      //   // cellRenderer: (params) => {
      //   //   if (this.hasDeleteAccess) {
      //   //     return `<input type="checkbox" class="chkallspares" data-action-type="select" />`
      //   //   }
      //   // }
      // },
      {
        headerName: 'Type',
        field: 'configTypeName',
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        filter: false,
        resizable: true,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'configTypeName',
      },
      // {
      //   headerName: 'Type',
      //   field: 'configValueId',
      //   filter: false,
      //   enableSorting: false,
      //   editable: false,
      //   resizable: true,
      //   sortable: false,
      //   width: 0,
      //   hide: true,
      // },
      // {
      //   headerName: 'Value',
      //   field: 'configValueName',
      //   resizable: true,
      //   filter: false,
      //   enableSorting: false,
      //   editable: false,
      //   sortable: false,
      //   width: 100,
      //   tooltipField: 'configValueName',
      // },
      {
        headerName: 'Part Number',
        field: 'partNo',
        filter: true,
        resizable: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'partNo',
      },
      {
        headerName: 'Part Type',
        field: 'partTypeName',
        filter: true,
        resizable: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'Part Type',
      },
      {
        headerName: 'Description',
        field: 'itemDesc',
        filter: true,
        resizable: true,
        editable: false,
        sortable: true,
        tooltipField: 'itemDesc',
      },
      {
        headerName: 'Sparepart Qty.',
        field: 'qty',
        filter: true,
        editable: false,
        sortable: true
      },
      // {
      //   headerName: 'Instrument Qty.',
      //   field: 'insQty',
      //   filter: true,
      //   editable: true,
      //   sortable: true
      // },
      {
        headerName: 'Desc. As Per Catlog',
        field: 'descCatalogue',
        resizable: true,
        filter: true,
        editable: false,
        sortable: true,
        tooltipField: 'descCatalogue',
      }
    ]
  }

  onAllSparesGridReady(params): void {
    this.allsparesapi = params.api;
    this.columnApi = params.columnApi;
    this.allsparesapi.showLoadingOverlay();
  }


  onQuickFilterChanged() {
    this.allsparesapi.setQuickFilter(
      (document.getElementById('quickFilter') as HTMLInputElement).value
    );
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }


  // onConfigChange(param: string) {
  //   this.configService.getById(param)
  //     .pipe(first()).subscribe((data: any) => this.configValueList = data.data);
  // }

  AddSelectedSpares() {
    if (confirm("Are you sure, you want to add the selected Spares?") == true) {
      var partNos = "";
      //var rows = this.allsparesapi.getSelectedRows(); // returns the selected rows
      this.allsparesapi.getSelectedRows().forEach(data => {
        if (this.sparePartDetails.filter(x => x.partNo == data.partNo).length > 0) {
          partNos += data.partNo + ", ";
        }
        else {
          data.insQty = 1;
          this.sparePartDetails = this.sparePartDetails.concat(data);
          let cnfig: ConfigTypeValue;
          cnfig = new ConfigTypeValue;
          //cnfig.id = data.configValueId;
          cnfig.listTypeItemId = data.configTypeId;
          cnfig.sparePartId = data.id;
          cnfig.insqty = "1";
          this.selectedConfigType.push(cnfig);
        }
      });
      this.recomandFilter();
      if (partNos != "") {
        alert("Part Nos -" + partNos + "already exists.");
      }
      this.allsparesapi.deselectAll();
      //$(".chkallspares").prop("checked", false);

    }
  }

  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      this.id = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the config type?") == true) {
            this.config = new InstrumentConfig();
            this.config.configTypeId = data.configTypeId;
            //this.config.configValueId = data.configValueId;
            this.config.instrumentId = this.id;
            this.config.sparepartId = data.id;
            if (this.id != null) {
              this.instrumentService.deleteConfig(this.config)
                .pipe(first())
                .subscribe(() => {
                  this.notificationService.showSuccess("Deleted Successfully", "Success");
                  this.selectedConfigType = this.selectedConfigType.filter(x => !( x.listTypeItemId == data.configTypeId && x.sparePartId == data.id));
                  this.sparePartDetails = this.sparePartDetails.filter(x => !(x.configTypeId == data.configTypeId && x.id == data.id));
                  this.recomandFilter();
                });
            }
            else {
              this.notificationService.showSuccess("Deleted Successfully ", "Success");
              this.selectedConfigType = this.selectedConfigType.filter(x => !( x.listTypeItemId == data.configTypeId && x.sparePartId == data.id));
              this.sparePartDetails = this.sparePartDetails.filter(x => !( x.configTypeId == data.configTypeId && x.id == data.id));
              this.recomandFilter();

            }
          }
        // case "select":
        //   if(this.sparePartDetails.filter(x=>x.partNo == data.partNo).length  == 0)
        //   {
        //     this.sparePartDetails = this.sparePartDetails.concat(data);
        //     // this.recomandFilter();

        //     // let cnfig: ConfigTypeValue;
        //     // cnfig = new ConfigTypeValue;
        //     // cnfig.id = data.configValueid;
        //     // cnfig.listTypeItemId = data.configTypeid;
        //     // cnfig.sparePartId = data.id;
        //     // this.selectedConfigType.push(cnfig);
        //   }
      }
    }
  }

  onCellValueChanged(event) {
    //debugger;
    var data = event.data;
    event.data.modified = true;
    if (this.selectedConfigType.filter(x => x.listTypeItemId == data.configTypeId
      && x.sparePartId == data.id).length > 0) {
      var d = this.selectedConfigType.filter(x => x.listTypeItemId == data.configTypeId
        && x.sparePartId == data.id);
      d[0].insqty = event.newValue;
    }
  }

  recomandFilter() {
    this.recomandedFilter = this.sparePartDetails.filter(x => x.partTypeName == "Recommended");
    this.consumfilter = this.sparePartDetails.filter(x => x.partTypeName == "Consumables");
    this.fullsparefilter = this.sparePartDetails.filter(x => x.partTypeName == "Full Spare");
    this.othersparefilter = this.sparePartDetails.filter(x => x.partTypeName == "Other Spare");
  }

  private pdfcreateColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'id',
        filter: false,
        enableSorting: false,
        editable: false,
        lockPosition: "left",
        sortable: false,
        cellRendererFramework: FilerendercomponentComponent,
        cellRendererParams: {
          deleteaccess: this.hasDeleteAccess,
          id: this.id
        },
      },
      {
        headerName: 'FileName',
        field: 'displayName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'fileName',
      },
    ]
  }

  private pdfcreateColumnDefsRO() {
    return [
      {
        headerName: 'FileName',
        field: 'displayName',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        width: 100,
        tooltipField: 'fileName',
      },
    ]
  }

  pdfonGridReady(params): void {
    this.pdfapi = params.api;
    this.pdfcolumnApi = params.columnApi;
  }

  public onPdfRowClicked(e) {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      this.id = this.route.snapshot.paramMap.get('id');
      switch (actionType) {
        case "remove":
          if (confirm("Are you sure, you want to remove the config type?") == true) {
            this.fileshareService.delete(data.id)
              .pipe(first())
              .subscribe({
                next: (d: any) => {
                  if (d.result) {
                    this.notificationService.showSuccess(d.resultMessage, "Success");
                    this.fileshareService.getById(this.id)
                      .pipe(first())
                      .subscribe({
                        next: (data: any) => {
                          this.PdffileData = data.data;
                        },
                      });
                  }
                },
              });
          }
          break;
        case "download":
          this.getPdffile(data.filePath);
      }
    }
  }

}

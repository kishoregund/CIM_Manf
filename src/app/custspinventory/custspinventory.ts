import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AccountService,
  AlertService,
  ConfigTypeValueService,
  ListTypeService,
  NotificationService,
  ProfileService,
  SparePartService
} from "../_services";
import { CustspinventoryService } from "../_services/custspinventory.service";
import { Custspinventory } from "../_models/custspinventory";
import { debounceTime, distinctUntilChanged, first, map } from "rxjs/operators";
import { ConfigTypeValue, ListTypeItem, ResultMsg, SparePart, User } from "../_models";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { DatePipe } from "@angular/common";
import { Observable, OperatorFunction } from "rxjs";
import { UserDetails } from "../_newmodels/UserDetails";
import { InstrumentService } from "../_services/instrument.service";
import { CustomerInstrumentService } from "../_services/customerinstrument.service";
import { BUBrandModel } from "../_newmodels/BUBrandModel";

@Component({
  selector: "app-Custspinventory",
  templateUrl: "./custspinventory.html",
})

export class CustSPInventoryComponent implements OnInit {
  form: FormGroup;
  model: Custspinventory;
  loading = false;
  submitted = false;
  isSave = false;
  type: string;
  id: string;
  user: UserDetails;
  profilePermission: any;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  hasInternalAccess: boolean = false;

  buBrandModel: BUBrandModel;
  replacementParts: SparePart[];
  configValueList: ConfigTypeValue[];
  listTypeItems: ListTypeItem[];

  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  historyModel
  sparepartlist: any[] = []
  instruments;
  lstSpareParts: any[] = []
  isEditMode: boolean;
  isNewMode: boolean;
  formData: { [key: string]: any; };

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
    private Service: CustspinventoryService,
    private sparePartService: SparePartService,
    private configService: ConfigTypeValueService,
    private profileService: ProfileService,
    //private instrumentService: InstrumentService,
    private custInstrumentService: CustomerInstrumentService,
  ) {
  }

  searchpart: OperatorFunction<string, readonly SparePart[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.lstSpareParts.filter(v => v.partNoDesc.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  formatterpart = (x: any) => x.partNoDesc;

  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "CTSPI");
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

    this.form = this.formBuilder.group({
      partNo: ["", Validators.required],
      hscCode: ["", Validators.required],
      qtyAvailable: [0, Validators.required],
      SearchPartNo: [""],
      sparePartId: [""],
      instrumentId: ["", Validators.required],
      isActive: [true],
      isDeleted: [false],
    })

    this.id = this.route.snapshot.paramMap.get("id");

    if (this.id != null) {
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            //this.getSparePartByPartNo(data.data.sparePart.partNo)
            // this.configService.getById(data.data.configType)
            //   .pipe(first())
            //   .subscribe({
            //     next: (data: any) => {
            //       this.configValueList = data.data;
            //     }
            //});
            // this.form.get("SearchPartNo")
            this.formData = data.data;
            this.form.patchValue(this.formData);
            this.Service.getHistory(this.id).pipe(first()).subscribe(
              (data: any) => {
                const datepipie = new DatePipe("en-US");
                data.data.forEach(value => {
                  value.serviceReportDate = datepipie.transform(value.serviceReportDate, 'dd/MM/YYYY')
                })
                this.historyModel = data.data;
              })
          },
        });
      this.form.disable()
    }
    else {
      this.isNewMode = true
    }

    // this.instrumentService.getAll(this.user.userId).pipe(first())
    //   .subscribe((data: any) =>
    //     this.instruments = data.data
    //   )

    this.custInstrumentService.GetInstrumentBySite(this.user.entityChildId).pipe(first())
      .subscribe((data: any) => {
        debugger;
        this.instruments = data.data
      });


    this.listTypeService.getById("CONTY")
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.listTypeItems = data.data;
        },
      });

    this.columnDefs = this.createColumnDefs();
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

      this.form.enable();
    }
  }

  Back() {
    this.router.navigate(["customerspinventorylist"]);

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.form.patchValue(this.formData);
    else this.form.reset();
    this.form.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {
      this.Service.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful)
            this.router.navigate(["customerspinventorylist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
        })
    }
  }



  async onInstrumentChange() {
    var insId = this.form.get('instrumentId').value;

    var data: any = await this.sparePartService.getAll().toPromise();
    data.isSuccessful ? this.sparepartlist = data.data : this.sparepartlist = []

    data = await this.custInstrumentService.getByInstrument(insId).toPromise();
    //data = await this.instrumentService.getById(insId).toPromise();
    this.instruments = data.data;

    //var dataa: any = await this.instrumentService.getInstrumentConfif(data.data.id).toPromise();
    var dataa: any = await this.custInstrumentService.getInstrumentSpares(insId).toPromise();
    this.lstSpareParts = []
    this.lstSpareParts = dataa.data;
  }

  onConfigChange(param: string) {
    this.configService.getById(param)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.configValueList = data.data;
        },
      });
  }

  onConfigVChange(configid: string) {
    //debugger;
    this.sparePartService.getByConfignValueId(configid)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.replacementParts = data.data;
        },
      });
  }

  onSearchByPartNo() {
    var partno = this.form.get("SearchPartNo").value;
    console.log(partno);

    if (!partno) return this.notificationService.showInfo("Please enter Part No.", "Info");

    this.form.get("sparePartId").setValue(partno.id)
    this.form.get("partNo").setValue(partno.partNo)
    this.form.get("hscCode").setValue(partno.hsCode)
    // partno = partno.partNo;
    // this.getSparePartByPartNo(partno)
  }

  getSparePartByPartNo(partno: string) {
    this.Service.GetSparePartByNo(partno)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          if (!data.isSuccessful || data.data == null) return;

          this.form.get("sparePartId").setValue(data.data.id)
          this.form.get("partNo").setValue(data.data.partno)
          this.form.get("hscCode").setValue(data.data.hscode)
          // this.form.get("SearchPartNo").setValue("")
        },
      })
  }

  get f() {
    return this.form.controls;
  }

  private createColumnDefs() {
    return [

      {
        headerName: "Service Request No.",
        field: "serReqNo",
        filter: true,
        tooltipField: "serReqNo",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Service Report Date",
        field: "serviceReportDate",
        filter: true,
        tooltipField: "qtyAvailable",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
      {
        headerName: "Qty Consumed",
        field: "qtyConsumed",
        filter: true,
        tooltipField: "partNo",
        enableSorting: true,
        editable: false,
        sortable: true,
      },
    ]
  }

  onGridReady(params: any): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();

  }

  onSubmit() {
    this.form.markAllAsTouched()
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();
    // stop here if form is invalid
    if (!this.form.get("partNo").value) return this.notificationService.showInfo("Please search and select a Spare Part", "Info")
    if (this.form.invalid) return;

    this.model = this.form.getRawValue();
    this.model.customerId = this.user.entityParentId;
    this.model.siteId = this.user.entityChildId;

    if (this.id == null) {
      this.Service.save(this.model)
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(
              data.messages[0],
              "Success"
            );
            this.router.navigate(["customerspinventorylist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
          }
        });
    }

    else {
      this.model = this.form.getRawValue();
      this.model.id = this.id;
      this.Service.update(this.id, this.model)
        .subscribe((data: any) => {
          if (data.isSuccessful) {
            this.notificationService.showSuccess(
              data.messages[0],
              "Success"
            );
            this.router.navigate(["customerspinventorylist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            });
          }
        });
    }
  }
}

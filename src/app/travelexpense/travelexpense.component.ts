import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { first } from 'rxjs/operators';
import { GetParsedDate } from '../_helpers/Providers';
import { ProfileReadOnly, ServiceRequest, Currency, User, Customer } from '../_models';
import { AccountService, AlertService, CurrencyService, FileshareService, ListTypeService, NotificationService, ProfileService } from '../_services';
import { EnvService } from '../_services/env/env.service';
import { TravelExpenseService } from '../_services/travel-expense.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { DistributorService } from '../_services/distributor.service';
import { CustomerService } from '../_services/customer.service';
import { ServiceRequestService } from '../_services/serviceRequest.service';
import { BUBrandModel } from '../_newmodels/BUBrandModel';
import { FilerendercomponentComponent } from '../instrument/filerendercomponent.component';

@Component({
  selector: 'app-travelexpense',
  templateUrl: './travelexpense.component.html'
})

export class TravelexpenseComponent implements OnInit {
  id: string;
  submitted = false;
  form: FormGroup;
  model: any;
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  user: UserDetails;

  engineer: any[] = [];
  servicerequest: ServiceRequest[] = [];

  DistributorList: any[] = [];
  IsCustomerView: boolean = false;
  IsDistributorView: boolean = false;
  IsEngineerView: boolean = false;

  public columnDefs: ColDef[];
  public columnDefsAttachments: any[];
  private columnApi: ColumnApi;
  private api: GridApi;

  file: any;
  attachments: any;
  fileList: [] = [];
  transaction: number;
  hastransaction: boolean;
  currencyList: Currency[];

  distId: string;
  natureOfExpense: any;
  customerList: Customer[];
  datepipe = new DatePipe('en-US')
  designationList: any;
  grandCompanyTotalAmt: any;
  grandEngineerTotalAmt: any;
  isEditMode: boolean;
  isNewMode: boolean;
  formData: any;
  buBrandModel: BUBrandModel;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private FileShareService: FileshareService,
    private TravelExpenseService: TravelExpenseService,
    private accountService: AccountService,
    private profileService: ProfileService,
    private distributorservice: DistributorService,
    private listTypeService: ListTypeService,
    private servicerequestservice: ServiceRequestService,
    private currencyService: CurrencyService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private router: Router,
    private numberPipe: DecimalPipe,
    private environment: EnvService,
  ) { }

  async ngOnInit() {
    this.transaction = 0;

    this.user = this.accountService.userValue;
    this.listTypeService.getItemById(this.user.roleId).pipe(first()).subscribe();
    let role = JSON.parse(sessionStorage.getItem('segments'));
    this.id = this.route.snapshot.paramMap.get("id");

    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(
        (x) => x.screenCode == "TREXP"
      );
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    this.form = this.formBuilder.group({
      engineerId: ["", [Validators.required]],
      serviceRequestId: ["", [Validators.required]],
      customerId: ["", Validators.required],
      distributorId: ["", Validators.required],
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      totalDays: 0,
      designation: "",
      grandCompanyTotal: 0.0,
      grandEngineerTotal: 0.0,
    })


    this.form.get('startDate').valueChanges
      .subscribe(() => this.OnDateChange())

    this.form.get('endDate').valueChanges
      .subscribe(() => this.OnDateChange())


    if (this.user.isAdmin) {
      this.hasAddAccess = false;
      this.hasDeleteAccess = false;
      this.hasUpdateAccess = false;
      this.hasReadAccess = false;
      this.notificationService.RestrictAdmin()
      return;
    }
    else role = role[0]?.itemCode;


    if (role == this.environment.custRoleCode) {
      this.IsCustomerView = true;
      this.IsDistributorView = false;
      this.IsEngineerView = false;
    }
    else if (role == this.environment.distRoleCode) {
      this.IsCustomerView = false;
      this.IsDistributorView = true;
      this.IsEngineerView = false;
    }

    else if (role == this.environment.engRoleCode) {
      this.IsCustomerView = false;
      this.IsDistributorView = false;
      this.IsEngineerView = true;
    }

    this.currencyService.getAll().pipe(first())
      .subscribe((data: any) => this.currencyList = data.data)

    this.distributorservice.getAll().pipe(first())
      .subscribe((data: any) => this.DistributorList = data.data)

    this.listTypeService.getById("DESIG").pipe(first())
      .subscribe((data: any) => this.designationList = data.data);

    this.customerService.getAll().pipe(first())
      .subscribe((data: any) => this.customerList = data.data);


    var data: any = await this.distributorservice.getByConId(this.user.contactId).toPromise();
    debugger;
    if (this.user.isAdmin) return;

    this.form.get('distributorId').setValue(data.data[0].id);
    var Engdata: any = await this.distributorservice.getDistributorRegionContacts(data.data[0].id, "Engineer").toPromise()
    this.distId = data.data[0].id
    this.engineer = Engdata.data;

    this.buBrandModel = new BUBrandModel();
    this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId;
    this.buBrandModel.brandId = this.user.selectedBrandId;
    var Srqdata: any = await this.servicerequestservice.getAll(this.buBrandModel).toPromise()
    this.servicerequest = Srqdata.data.filter(x => x.isReportGenerated);
    // this.servicerequestservice.getAll(this.buBrandModel).pipe(first())
    //   //this.servicerequestservice.GetServiceRequestByDist(data.data[0].id).pipe(first())
    //   .subscribe((Srqdata: any) =>
    //     this.servicerequest = Srqdata.data.filter(x => x.distId == data.data[0].id)// && !x.isReportGenerated)
    //     //this.servicerequest = Srqdata.data.filter(x => x.assignedTo == data.data[0].id && !x.isReportGenerated)
    //   );

    if (this.IsEngineerView) {
      this.form.get('engineerId').setValue(this.user.contactId)
      await this.getservicerequest(this.distId, this.user.contactId)
    }

    this.form.get("startDate").valueChanges
      .subscribe(value => {
        var serreqVal = this.form.get("serviceRequestId").value;
        let serreq = this.servicerequest.find(x => x.id == serreqVal);
        if (value < GetParsedDate(serreq?.serReqDate)) {
          this.notificationService.showError("Start date should be after Service Request date", "Invalid Date")
        }
      });

    if (this.id != null) {
      this.TravelExpenseService.getById(this.id)
        .pipe(first()).subscribe((data: any) => {
          this.getservicerequest(data.data.distributorId, data.data.engineerId);
          setTimeout(() => {
            this.GetFileList(data.data.id)
            this.formData = data.data;
            this.form.patchValue(this.formData);
            this.form.patchValue({ "grandEngineerTotal": this.numberPipe.transform(this.grandEngineerTotalAmt) })
            this.form.patchValue({ "grandCompanyTotal": this.numberPipe.transform(this.grandCompanyTotalAmt) })
          }, 400)
        });

      this.form.disable()
      this.columnDefsAttachments = this.createColumnDefsAttachmentsRO()
    }
    else {
      this.FormControlDisable()
      this.columnDefsAttachments = this.createColumnDefsAttachments()
      this.isNewMode = true
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

      this.form.enable();
      this.columnDefsAttachments = this.createColumnDefsAttachments()
      this.FormControlDisable();
    }
  }

  Back() {
    this.router.navigate(["travelexpenselist"]);
  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    if (this.id != null) this.form.patchValue(this.formData);
    else this.form.reset();
    this.form.disable()
    this.columnDefsAttachments = this.createColumnDefsAttachmentsRO()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  FormControlDisable() {
    if (this.IsEngineerView) {
      this.form.get('engineerId').disable()
    }
    this.form.get('totalDays').disable()
  }

  DeleteRecord() {
    if (confirm("Are you sure you want to delete the record?")) {

      this.profileService.delete(this.id).pipe(first())
        .subscribe((data: any) => {
          if (data.isSuccessful)
            this.router.navigate(["travelexpenselist"], {
              //relativeTo: this.activeRoute,
              queryParams: { isNSNav: true },
              //queryParamsHandling: 'merge'
            })
        })
    }
  }

  get f() {
    return this.form.controls
  }

  onGrandEngineerTotal = (e) => {
    this.grandEngineerTotalAmt = e
    this.form.get("grandEngineerTotal").setValue(e);
  }

  onGrandCompanyTotal = (e) => {
    this.grandCompanyTotalAmt = e
    this.form.get("grandCompanyTotal").setValue(e);
  }


  async getservicerequest(id: string, engId = null) {
    let engid = this.form.get('engineerId').value
    if (engid) {
      let designation = this.engineer.find(x => x.id == engid).designationId
      this.form.get('designation').setValue(designation)
    }

    //var Srqdata: any = await this.servicerequestservice.GetServiceRequestByDist(id).toPromise();
    //this.servicerequest = Srqdata.object.filter(x => x.assignedto == engId)
    this.servicerequest = this.servicerequest.filter(x => x.assignedTo == engId);
  }

  getengineers(id: string) {
    this.distributorservice.getDistributorRegionContacts(id, "Engineer")
      .pipe(first())
      .subscribe((Engdata: any) => {
        this.distId = id
        this.engineer = Engdata.data;
      });
  }

  onServiceRequestChange() {
    var sreq = this.form.get('serviceRequestId').value
    var custid = this.servicerequest.find(x => x.id == sreq).custId
    this.form.get('customerId').setValue(custid);

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

    for (let i = 0; i < x.length; i++) {
      var name = x[i].name;
      var ul = document.getElementById("demo");
      var node = document.createElement("li");
      node.appendChild(document.createTextNode(name));
      ul.appendChild(node);
    }
  };

  createColumnDefsAttachmentsRO() {
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

  createColumnDefsAttachments() {
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
          id: this.id
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

  public uploadFile = (files, id) => {
    if (files.length === 0) {
      return;
    }
    let filesToUpload: File[] = files;
    const formData = new FormData();

    Array.from(filesToUpload).map((file, index) => {
      return formData.append("file" + index, file, file.name);
    });
    this.FileShareService.upload(formData, id, "TREXP", null).subscribe((event) => { });
  };

  GetFileList(id: string) {
    this.FileShareService.list(id).pipe(first())
      .subscribe((data: any) => this.attachments = data.data);
  }

  onGridReadyAttachments(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  OnDateChange() {
    setTimeout(() => {
      let currentDate = GetParsedDate(this.form.value.startDate);
      let dateSent = GetParsedDate(this.form.value.endDate);

      if (currentDate && dateSent) {
        let calc = Math.floor(
          (Date.UTC(
            dateSent.getFullYear(),
            dateSent.getMonth(),
            dateSent.getDate()
          ) -
            Date.UTC(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate()
            )) /
          (1000 * 60 * 60 * 24)
        );
        if (calc > -365)
          this.form.get('totalDays').setValue(calc)
        else
          this.form.get('totalDays').reset()
      }
    }, 100)

  }

  onSubmit() {
    this.form.markAllAsTouched()
    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
debugger;
    if (this.form.invalid) {
      return;
    }
    this.OnDateChange()

    if (this.form.get('totalDays').value != null && this.form.get('totalDays').value < 1)
      return this.notificationService.showError("The difference between Start Date and End Date should be more than 1 day !", "Error");

    this.model = this.form.getRawValue();
    var value = this.model.startDate
    var serreqVal = this.form.get("serviceRequestId").value;
    let serreq = this.servicerequest.find(x => x.id == serreqVal);
    if (value < GetParsedDate(serreq.serReqDate)) {
      this.notificationService.showError("Start date should be after Service Request date", "Invalid Date")
    }

    this.model.startDate = this.datepipe.transform(GetParsedDate(this.model.startDate), 'dd/MM/YYYY');
    this.model.endDate = this.datepipe.transform(GetParsedDate(this.model.endDate), 'dd/MM/YYYY');
    this.model.distId = this.distId;
    this.model.grandCompanyTotal = parseInt(this.model.grandCompanyTotal);
    this.model.grandEngineerTotal = parseInt(this.model.grandEngineerTotal);

    if (isNaN(this.model.grandCompanyTotal)) {
      this.model.grandCompanyTotal = 0;
    }
    if (isNaN(this.model.grandEngineerTotal)) {
      this.model.grandEngineerTotal = 0;
    }

    if (this.IsEngineerView) this.model.engineerId = this.user.contactId;

    if (this.id == null) {
      this.TravelExpenseService.save(this.model)
        .subscribe((data: any) => {
          if (this.file != null) this.uploadFile(this.file, data.data.id);
          if (data.isSuccessful) {
            this.notificationService.showSuccess("Saved Successfully", "Success");
            this.router.navigate(["travelexpenselist"], {
              queryParams: { isNSNav: true },
            });
          }
        });
    }

    else {
      this.model.id = this.id
      this.TravelExpenseService.update(this.id, this.model)
        .subscribe((data: any) => {
          if (this.file != null) {
            this.uploadFile(this.file, this.id);
          }

          if (data.isSuccessful) {
            this.notificationService.showSuccess("Saved Successfully", "Success");
            this.router.navigate(["travelexpenselist"], {
              queryParams: { isNSNav: true },
            });
          }
        });
    }


  }
}

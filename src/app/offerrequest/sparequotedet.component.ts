import { Component, Input, OnInit } from '@angular/core';
import { User } from "../_models";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Sparequotedet } from "../_models/sparequotedet";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AccountService,
  ConfigTypeValueService,
  ListTypeService,
  NotificationService,
  ProfileService
} from "../_services";
import { BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { SpareQuoteDetService } from "../_services/sparequotedet.service";
import { DatePipe } from "@angular/common";
import { UserDetails } from '../_newmodels/UserDetails';

// import {moment} from "ngx-bootstrap/chronos/test/chain";

@Component({
  selector: 'app-sparequotedet',
  templateUrl: './sparequotedet.component.html'
})

export class SparequotedetComponent implements OnInit {

  user: UserDetails;
  Form: FormGroup;
  sparequotedet: Sparequotedet
  loading = false;
  submitted = false;
  isSave = false;
  listid: string;
  public columnDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  closeResult: string;
  statusList: any
  raisedByList: any
  @Input() public parentId;
  @Input() public id;

  currentStatus: string;
  completedId: string = "COMP";
  PORaisedId: string = "ZPORD";
  shippedId: string = "SHPED";

  datepipie = new DatePipe("en-US");
  showStatus: boolean;
  ShowCustResponseDate: boolean;
  isRaisedBy: boolean;

  profilePermission: any;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;

  hasId: boolean = false;
  formData: any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private configTypeService: ConfigTypeValueService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private Service: SpareQuoteDetService,
    private profileService: ProfileService,
    public activeModal: BsModalService
  ) {
  }


  ngOnInit() {
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "OFREQ");
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

    this.Form = this.formBuilder.group({
      raisedBy: ['', Validators.required],
      raisedDate: ["", Validators.required],
      custResponseDate: [""],
      comments: [''],
      status: [''],
      zohoPORaisedDate: [""],
      deliveredOn: [""],
      shippedDate: [""],
      isActive: [true],
      isDeleted: [false],
    });

    this.listTypeService.getById("SQDTS")
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.statusList = data.data;
        }
      });

    this.Service.GetDistContacts(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.raisedByList = data.data;
        }
      });

    if (this.id != undefined) {
      this.hasId = true
      this.Service.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            data.data.zohoPORaisedDate = this.datepipie.transform(data.data.zohoPORaisedDate, 'dd/MM/YYYY');
            data.data.deliveredOn = this.datepipie.transform(data.data.deliveredOn, 'dd/MM/YYYY');
            data.data.custResponseDate = this.datepipie.transform(data.data.custResponseDate, 'dd/MM/YYYY');
            data.data.shippedDate = this.datepipie.transform(data.data.shippedDate, 'dd/MM/YYYY');
            data.data.raisedDate = this.datepipie.transform(data.data.raisedDate, 'dd/MM/YYYY');
            this.statusChanged(data.data.status)

            if ((data.data.raisedBy != null && data.data.raisedBy != "") && (data.data.raisedDate != null && data.data.raisedDate != "")) {
              this.ShowCustResponseDate = true
              this.isRaisedBy = true
              this.Form.get('custResponseDate').setValidators([Validators.required])
              this.Form.get('custResponseDate').updateValueAndValidity()

            }
            this.formData = data.data;
            this.Form.patchValue(this.formData);

            var raisedby = document.getElementById('raisedBy') as HTMLInputElement
            raisedby.disabled = true
            var raisedDAte = document.getElementById('raisedDate') as HTMLInputElement
            raisedDAte.disabled = true
          }
        });
    } else {
      this.hasId = false
    }
    this.Form.get('custResponseDate').valueChanges.subscribe(value => {
      if (value != null) {
        this.Form.get('status').setValidators([Validators.required])
        this.Form.get('status').updateValueAndValidity()
      }
    })
    this.Form.get('status').valueChanges.subscribe(
      value => {
        value = this.statusList.filter(status => status.listTypeItemId == value)[0]?.itemCode;
        if (value != null) {
          switch (value) {
            case this.completedId:
              this.Form.get('deliveredOn').setValidators([Validators.required])
              this.Form.get('deliveredOn').updateValueAndValidity()

              this.Form.get('shippedDate').clearValidators()
              this.Form.get('shippedDate').updateValueAndValidity()

              this.Form.get('zohoPORaisedDate').clearValidators()
              this.Form.get('zohoPORaisedDate').updateValueAndValidity()

              break;

            case this.shippedId:
              this.Form.get('deliveredOn').clearValidators()
              this.Form.get('deliveredOn').updateValueAndValidity()

              this.Form.get('shippedDate').setValidators([Validators.required])
              this.Form.get('shippedDate').updateValueAndValidity()

              this.Form.get('zohoPORaisedDate').clearValidators()
              this.Form.get('zohoPORaisedDate').updateValueAndValidity()
              break;

            case this.PORaisedId:
              this.Form.get('deliveredOn').clearValidators()
              this.Form.get('deliveredOn').updateValueAndValidity()

              this.Form.get('shippedDate').clearValidators()
              this.Form.get('shippedDate').updateValueAndValidity()

              this.Form.get('zohoPORaisedDate').setValidators([Validators.required])
              this.Form.get('zohoPORaisedDate').updateValueAndValidity()
              break;
          }

        }
      }
    )
  }

  get f() {
    return this.Form.controls;
  }

  changeDate(e, screen) {
    if (e != null && e != "") {
      switch (screen) {

        case "RaisedBy":
          this.isRaisedBy = true
          break

        case "CustResDate":
          this.showStatus = true
          break

        case "RaisedDate":
          this.ShowCustResponseDate = true
          break
      }
    }
  }

  close() {
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  statusChanged(sta: string) {
    this.currentStatus = this.statusList.filter(status => status.listTypeItemId == sta)[0]?.itemCode;
  }

  onValueSubmit() {
    //debugger;

    this.submitted = true;

    if (this.Form.invalid) {
      return
    }

    this.isSave = true;
    this.loading = true;

    this.sparequotedet = this.Form.value;
    this.sparequotedet.offerRequestId = this.parentId;

    this.sparequotedet.zohoPORaisedDate = this.datepipie.transform(this.sparequotedet.zohoPORaisedDate, 'dd/MM/YYYY');
    this.sparequotedet.deliveredOn = this.datepipie.transform(this.sparequotedet.deliveredOn, 'dd/MM/YYYY');
    this.sparequotedet.custResponseDate = this.datepipie.transform(this.sparequotedet.custResponseDate, 'dd/MM/YYYY');
    this.sparequotedet.raisedDate = this.datepipie.transform(this.sparequotedet.raisedDate, 'dd/MM/YYYY');
    this.sparequotedet.shippedDate = this.datepipie.transform(this.sparequotedet.shippedDate, 'dd/MM/YYYY');

    if (this.id == null) {
      this.Service.save(this.sparequotedet)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.close();
            } else {

              this.close();
            }
            this.loading = false;
          },
          error: error => {

            this.loading = false;
          }
        });
    } else {
      this.sparequotedet.id = this.id;
      this.Service.update(this.id, this.sparequotedet)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.close();
            } else {

              this.close();
            }
            this.loading = false;
          },
          error: error => {

            this.loading = false;
          }
        });
    }
  }

}

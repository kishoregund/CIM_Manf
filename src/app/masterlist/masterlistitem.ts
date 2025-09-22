import { Component, OnInit } from '@angular/core';

import { ListTypeItem, ProfileReadOnly, User } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';
import { AccountService, AlertService, ListTypeService, NotificationService, ProfileService } from '../_services';
import { MRenderComponent } from './rendercomponent';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ModelContentComponent } from './modelcontent';
//import { PrevchklocpartelementvalueComponent } from "./prevchklocpartelementvalue.component";
import { EnvService } from '../_services/env/env.service';
import { AgRendererComponent } from 'ag-grid-angular';
import { UserDetails } from '../_newmodels/UserDetails';

@Component({
  selector: 'app-masterlistitem',
  templateUrl: './masterlistitem.html',
})
export class MasterListItemComponent implements OnInit {
  user: UserDetails;
  masterlistitemform: FormGroup;
  loading = false;
  submitted = false;
  isSave = false;
  id: string;
  listid: string;
  itemList: ListTypeItem[];
  ItemData: ListTypeItem;
  code: string = "";
  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  public columnDefs: ColDef[];
  public colReadOnlyDefs: ColDef[];
  private columnApi: ColumnApi;
  private api: GridApi;
  bsModalRef: BsModalRef;
  addAccess: boolean = false;
  list2
  isNewMode: any;
  isEditMode: any;
  designation: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private listTypeService: ListTypeService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "MAST");
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

    this.masterlistitemform = this.formBuilder.group({
      itemName: ['', Validators.required],
      code: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(5)])],
      listName: [''],
      listTypeId: [''],
      listCode: [''],
      id: [''],
      isEscalationSupervisor: false,
    });

    this.listid = this.route.snapshot.paramMap.get('id');
    if (this.listid != null) {

      this.hasAddAccess = this.user.isAdmin;
    }
    this.listTypeService.getByListId(this.listid)
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.itemList = data.data
          if (this.itemList.length > 0) {
            this.designation = this.itemList[0].listCode == "DESIG";
            this.masterlistitemform.get("listName").setValue(this.itemList[0].listName);
            this.masterlistitemform.get("listTypeId").setValue(this.itemList[0].listTypeId);
            this.masterlistitemform.get("listCode").setValue(this.itemList[0].listCode);
            console.log(data);

          }
          else {
            this.listTypeService.GetListById(this.listid)
              .subscribe((data: any) => {
                this.masterlistitemform.get("listName").setValue(data.data.listName);
                this.masterlistitemform.get("listTypeId").setValue(data.data.id);
                this.masterlistitemform.get("listCode").setValue(data.data.listCode);
                console.log(data);

              })
          }
          setTimeout(() => {
            this.columnDefs = this.createColumnDefs();
            this.colReadOnlyDefs = this.columnReadOnlyDefs();
          }, 0);
        }
      });

    this.columnDefs = this.createColumnDefs();
    this.colReadOnlyDefs = this.columnReadOnlyDefs();

    if (!this.id) {
      this.masterlistitemform.disable()
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

      this.masterlistitemform.enable();
      this.FormControlDisable();
    }
  }

  Back() {
    this.router.navigate(["masterlist"])

  }

  CancelEdit() {
    if (!confirm("Are you sure you want to discard changes?")) return;
    this.masterlistitemform.disable()
    this.isEditMode = false;
    this.isNewMode = false;
    this.notificationService.SetNavParam();
  }

  FormControlDisable() {

  }

  // DeleteRecord() {
  //   if (confirm("Are you sure you want to delete the record?")) {

  //     this.listTypeService.delete(this.id).pipe(first())
  //       .subscribe((data: any) => {
  //         if (data.result) {
  //           this.router.navigate(["sparepartlist"])
  //         }
  //         else {
  //           this.notificationService.showInfo(data.resultMessage, "Info");
  //         }
  //       })
  //   }
  // }

  open(param: string) {
    const initialState = { itemId: param };
    this.bsModalRef = this.modalService.show(ModelContentComponent, { initialState });
  }

  close() {
    alert('test');
    this.bsModalRef.hide();
  }

  private createColumnDefs() {
    return [
      {
        headerName: 'Action',
        field: 'listTypeItemId',
        filter: false,
        enableSorting: false,
        editable: false,
        sortable: false,
        cellRendererFramework: MRenderComponent,
        cellRendererParams: {
          deleteLink: 'LITYIT',
          deleteaccess: this.hasDeleteAccess,
          addAccess: this.addAccess,
          hasUpdateAccess: this.hasUpdateAccess,
          disabled: !this.isEditMode
        },
      },
      {
        headerName: 'Item Name',
        field: 'itemName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'itemName',
      },
      {
        headerName: "Is Escalation Supervisor?",
        field: "isEscalationSupervisor",
        filter: true,
        enableSorting: true,
        hide: !this.designation,
        sortable: true,
        cellRendererFramework: IsEscationSupervisor,
      }
    ]
  }

  private columnReadOnlyDefs() {
    return [
      {
        headerName: 'Item Name',
        field: 'itemName',
        filter: true,
        enableSorting: true,
        editable: false,
        sortable: true,
        tooltipField: 'itemName',
        width: 800
      },
      {
        headerName: "Is Escalation Supervisor?",
        field: "isEscalationSupervisor",
        cellRendererFramework: IsEscationSupervisor,
        filter: true,
        enableSorting: true,
        sortable: true,
        hide: !this.designation
      }
    ]
  }

  onGridReadyRO(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    // this.api.sizeColumnsToFit();
  }

  onGridReady(params): void {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
  }

  onRowClicked(e): void {
    //debugger;
    if (e.event.target !== undefined) {
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");

      switch (actionType) {
        case "add":
          this.open(data.listTypeItemId);
          break

        case "edit":
          if (data.isMaster) this.masterlistitemform.get("isEscalationSupervisor").disable()
          this.masterlistitemform.get("id").setValue(data.listTypeItemId);
          this.masterlistitemform.get("itemName").setValue(data.itemName);//itemCode
          this.masterlistitemform.get("code").setValue(data.itemCode);
          this.masterlistitemform.get("code").disable();
          this.masterlistitemform.get("isEscalationSupervisor").setValue(data.isEscalationSupervisor);
          this.masterlistitemform.get("listTypeId").setValue(data.listTypeId);
          this.id = data.listTypeItemId;
          this.code = data.itemCode
          break;
      }
    }
  };

  // convenience getter for easy access to form fields
  get f() { return this.masterlistitemform.controls; }

  onSubmit() {
    this.masterlistitemform.markAllAsTouched();
    // stop here if form is invalid
    if (this.masterlistitemform.invalid) {
      return;
    }

    this.isSave = true;
    this.loading = true;

    if (this.id == null) {
      this.listTypeService.save(this.masterlistitemform.value)
        .pipe(first()).subscribe((data: any) => {
          if (!data.isSuccessful) return;

          this.notificationService.showSuccess(data.messages[0], "Success");
          //this.itemList = data.data;

          this.masterlistitemform.get("itemName").markAsUntouched();
          this.masterlistitemform.get("itemName").setValue("");

          this.masterlistitemform.get("code").markAsUntouched();
          this.masterlistitemform.get("code").setValue("");

          this.listTypeService.getByListId(this.listid)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                this.itemList = data.data;
              }
            });
        });

    }
    else {
      this.ItemData = this.masterlistitemform.value;
      this.ItemData.code = this.code;
      this.listTypeService.update(this.id, this.ItemData)
        .pipe(first()).subscribe((data: any) => {
          if (!data.isSuccessful) return;
          this.notificationService.showSuccess(data.messages[0], "Success");
          this.masterlistitemform.get("itemName").reset();
          this.masterlistitemform.get("code").reset();
          this.masterlistitemform.get("isEscalationSupervisor").reset();
          this.id = null;
          this.itemList = data.data;
        });

    }


  }

}


@Component({
  template: `
  <form [formGroup]="form">
      <input class="form-check-input" formControlName="isEscalationSupervisor" type="checkbox">
  </form>

  `
})
export class IsEscationSupervisor implements AgRendererComponent {
  form: FormGroup

  params: any;
  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      isEscalationSupervisor: [0]
    })
  }


  agInit(params: any): void {
    this.params = params;
    this.form.get("isEscalationSupervisor").setValue(params.value)
    this.form.get("isEscalationSupervisor").disable()
  }

  refresh(params: any): boolean {
    return false;
  }

}

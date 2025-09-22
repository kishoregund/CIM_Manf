import { Component, Input, OnInit } from '@angular/core';

import { User, workDone } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  ConfigTypeValueService,
  ListTypeService,
  NotificationService,
} from '../_services';
import { BsModalService } from 'ngx-bootstrap/modal';
import { UserDetails } from '../_newmodels/UserDetails';
import { WorkDoneService } from '../_services/workdone.service';

@Component({
  selector: 'app-workdonecomponent',
  templateUrl: './workdonecontent.html',
})
export class WorkdoneContentComponent implements OnInit {
  user: UserDetails;
  workdoneForm: FormGroup;
  workDone: workDone;
  loading = false;
  submitted = false;
  isSave = false;
  servicereportId: string;
  //id: string;
  listid: string;
  public columnDefs: ColDef[];
  closeResult: string;
  @Input() public itemId;
  @Input() public id;
  formData: any;


  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private workDoneService: WorkDoneService,
    public activeModal: BsModalService
  ) { }


  ngOnInit() {
    this.user = this.accountService.userValue;

    this.workdoneForm = this.formBuilder.group({
      workDone: ['', Validators.required],
      isActive: [true],
      isDeleted: [false],

    });
    if (this.id != undefined) {
      this.workDoneService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            this.formData = data.data;
            this.workdoneForm.patchValue(this.formData);
            // this.engineerCommentForm.patchValue({ "nextdate": new Date(data.data.nextdate) });
          },
          error: error => {
            // this.alertService.error(error);
            this.loading = false;
          }
        });
    }
  }

  close() {
    //alert('test cholde');
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  onValueSubmit() {
    debugger;

    this.submitted = true;

    this.isSave = true;
    this.loading = true;

    if (this.workdoneForm.invalid) {
      return;
    }
    this.workDone = this.workdoneForm.value;
    this.workDone.serviceReportId = this.itemId;

    if (this.id == null) {
      this.workDoneService.save(this.workDone)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.close();
              //this.configList = data.data;
              // this.listvalue.get("configValue").setValue("");
            }
            else {

              this.close();
            }
            this.loading = false;
          },
          error: () => {

            this.loading = false;
          }
        });
    }
    else {
      this.workDone.id = this.id;
      this.workDoneService.update(this.id, this.workDone)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (data.isSuccessful) {
              this.notificationService.showSuccess(data.messages[0], "Success");
              this.close();
              //this.configList = data.data;
              //this.listvalue.get("configValue").setValue("");
              //this.id = null;
            }
            else {

              this.close();
            }
            this.loading = false;
          },
          error: () => {

            this.loading = false;
          }
        });
    }
  }
}

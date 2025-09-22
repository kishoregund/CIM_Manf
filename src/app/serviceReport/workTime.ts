import { Component, Input, OnInit } from '@angular/core';

import { User, workTime } from '../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ColDef, ColumnApi, GridApi } from 'ag-grid-community';

import {
  AccountService,
  ConfigTypeValueService,
  ListTypeService,
  NotificationService
} from '../_services';
import { BsModalService } from 'ngx-bootstrap/modal';
import { GetParsedDate } from '../_helpers/Providers';
import { UserDetails } from '../_newmodels/UserDetails';
import { WorkTimeService } from '../_services/worktime.service';


@Component({
  selector: 'app-workTimecomponent',
  templateUrl: './workTime.html',
})
export class WorkTimeContentComponent implements OnInit {
  user: UserDetails;
  workTimeForm: FormGroup;
  workTime: workTime;
  loading = false;
  submitted = false;
  isSave = false;
  servicereportId: string;
  listid: string;
  public columnDefs: ColDef[];
  closeResult: string;
  @Input() public itemId;
  @Input() public item;
  @Input() public id;
  formData: any;


  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private workTimeService: WorkTimeService,
    public activeModal: BsModalService
  ) { }


  ngOnInit() {
    this.user = this.accountService.userValue;

    this.workTimeForm = this.formBuilder.group({
      workTimeDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      perDayHrs: ['', Validators.required],
      isActive: [true],
      isDeleted: [false],

    });


    this.workTimeForm.get("workTimeDate").valueChanges
      .subscribe(value => {
        console.log(this.item);
        
        if (value < GetParsedDate(this.item.serReqDate)) {
          this.notificationService.showError("The Date should be after Service Request Date", "Invalid Date")
        }
      })

    if (this.id == undefined) return;

    this.workTimeService.getById(this.id)
      .subscribe((data: any) => {
        this.formData = data.data;
        this.workTimeForm.patchValue(this.formData);
        this.workTimeForm.patchValue({ "workTimeDate": new Date(data.data.workTimeDate) });
        this.PerDayHrs()
      });
  }

  close() {
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  get f() {
    return this.workTimeForm.controls
  }

  PerDayHrs() {
    let startTime: Date;
    let endTime: Date;

    startTime = new Date(new Date(this.workTimeForm.get('workTimeDate').value).toDateString() + " " + this.workTimeForm.get('endTime').value);
    endTime = new Date(new Date(this.workTimeForm.get('workTimeDate').value).toDateString() + " " + this.workTimeForm.get('startTime').value);

    let diff = (startTime.getTime() - endTime.getTime()) / (1000 * 60 * 60);
    if (
      this.workTimeForm.get('workTimeDate').value != "" &&
      this.workTimeForm.get('endTime').value != "" &&
      this.workTimeForm.get('startTime').value != ""
    ) {

      if (diff > 0) {
        this.workTimeForm.get('perDayHrs').setValue(diff.toFixed(2).toString());
      } else {
        diff = 0;
        this.workTimeForm.get('perDayHrs').setValue(diff.toString());
        this.notificationService.showError("End Time should not be earlier than Start Time.", "Invalid Time Range")
      }

    }
  }

  onValueSubmit() {
    this.workTimeForm.markAllAsTouched();
    if (this.workTimeForm.get("workTimeDate").value < GetParsedDate(this.item.serReqDate))
      return this.notificationService.showError("The Work Time Date should be after Service Request Date", "Invalid Date")

    if (this.workTimeForm.invalid) return this.notificationService.showError("Please fill all required fields", "Invalid Form");

    this.workTime = this.workTimeForm.value;
    this.workTime.serviceReportId = this.itemId;

    if (this.id == null) {
      this.workTimeService.save(this.workTime)
        .subscribe((data: any) => {
          if (data.isSuccessful) this.notificationService.showSuccess(data.messages[0], "Success");
          this.close();
        });
    }
    else {
      this.workTime.id = this.id;
      this.workTimeService.update(this.id, this.workTime)
        .subscribe((data: any) => {
          if (data.isSuccessful) this.notificationService.showSuccess(data.messages[0], "Success");
          this.close();
        });
    }
  }
}

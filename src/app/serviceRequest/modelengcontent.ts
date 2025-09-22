import { Component, Input, OnInit } from '@angular/core';

import { EngineerCommentList, User } from '../_models';
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
import { EngCommentService } from '../_services/engcomment.service';


@Component({
  selector: 'app-modelcomponent',
  templateUrl: './modelengcontent.html',
})
export class ModelEngContentComponent implements OnInit {
  user: UserDetails;
  engineerCommentForm: FormGroup;
  engcomment: EngineerCommentList;
  //id: string;
  listid: string;
  closeResult: string;
  @Input() itemId;
  @Input() item;
  @Input() id;
  @Input() engineerid;
  formData: any;


  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private engcommentService: EngCommentService,
    public activeModal: BsModalService
  ) { }


  ngOnInit() {
    this.user = this.accountService.userValue;

    this.engineerCommentForm = this.formBuilder.group({
      comments: ['', Validators.required],
      nextDate: ['', Validators.required],
      isActive: [true],
      isDeleted: [false],

    });

    this.engineerCommentForm.get("nextDate").valueChanges
      .subscribe(value => {
        if (value < GetParsedDate(this.item.serReqDate)) {
          this.notificationService.showError("The Next Date should be after Service Request Date", "Invalid Date")
        }
      })

    if (this.id == undefined) return;
    this.engcommentService.getById(this.id)
      .subscribe((data: any) => {
        this.formData = data.data;
        this.engineerCommentForm.patchValue(this.formData);
        this.engineerCommentForm.patchValue({ "nextDate": new Date(data.data.nextDate) });
      });
  }

  close() {
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

  get f() {
    return this.engineerCommentForm.controls
  }

  onValueSubmit() {
    this.engineerCommentForm.markAllAsTouched();
    if (this.engineerCommentForm.invalid) {
      return;
    }

    if (this.f.nextDate.value < GetParsedDate(this.item.serReqDate)) {
      return this.notificationService.showError("The Next Date should be after Service Request Date", "Invalid Date")
    }

    this.engcomment = this.engineerCommentForm.value;
    this.engcomment.serviceRequestId = this.itemId;
    this.engcomment.engineerId = this.engineerid;

    if (this.id == null) {
      this.engcommentService.save(this.engcomment)
        .subscribe((data: any) => {
          if (data.isSuccessful)
            this.notificationService.showSuccess(data.messages[0], "Success");
          this.close();
        });
    }
    else {
      this.engcomment.id = this.id;
      this.engcommentService.update(this.id, this.engcomment)
        .subscribe((data: any) => {
          if (data.isSuccessful)
            this.notificationService.showSuccess(data.messages[0], "Success");
          this.close();
        });
    }
  }
}

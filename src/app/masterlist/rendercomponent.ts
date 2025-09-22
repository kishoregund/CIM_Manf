import { Component } from '@angular/core';
import { first } from 'rxjs/operators';
import { AgRendererComponent } from 'ag-grid-angular';
import {
  ConfigTypeValueService,
  //DistributorService,
  ListTypeService,
  NotificationService
} from '../_services';
//import { PrevchklocpartelementService } from '../_services/prevchklocpartelement.service';
import { EnvService } from '../_services/env/env.service';

@Component({
  template: `
    <button *ngIf="!isMaster" class="btn btn-link" data-action-type="remove" (click)="delete(params)"><i class="fas fa-trash-alt" title="Delete"></i></button>    
    <button *ngIf="!isMaster" class="btn btn-link" [disabled]="!params.hasUpdateAccess" data-action-type="edit"><i class="fas fas fa-pen" title="Edit Value"
                                                                                                data-action-type="edit"></i></button>
`
// <button class="btn btn-link" *ngIf="hasAddAccess" [disabled]="!hasAddAccess" data-action-type="add"><i class="fas fa-plus-circle" title="Add Value" data-action-type="add"></i></button>
})
export class MRenderComponent implements AgRendererComponent {
  params: any;
  isMaster: boolean = false;
  hasAddAccess: any;

  constructor(
    private notificationService: NotificationService,
    private listTypeService: ListTypeService,
    private configService: ConfigTypeValueService,
    //private distributorService: DistributorService,
    //private prevchklocpartelementService: PrevchklocpartelementService,
    private environment: EnvService
  ) {

  }
  agInit(params: any): void {
    console.log(params);

    this.params = params;
    this.isMaster = params.data.isMaster
    this.hasAddAccess = params.data.listCode == this.environment.configTypeCode || params.data.listCode == this.environment.location;

  }

  refresh(params: any): boolean {
    return false;
  }


  delete(params: any) {
    //debugger;
    if (confirm("Are you sure, you want to delete the record?") == true) {
      if (params.deleteLink == "D") {
        //debugger; [KG]
        // this.distributorService.delete(params.value)
        //   .pipe(first())
        //   .subscribe({
        //     next: (data: any) => {
        //       //debugger;
        //       if (data.result) {
        //         this.notificationService.showSuccess(data.resultMessage, "Success");
        //         const selectedData = params.api.getSelectedRows();
        //         params.api.applyTransaction({ remove: selectedData });
        //       }
        //       else {
        //         this.notificationService.showInfo(data.resultMessage, "Info");
        //       }
        //     },
        //     error: () => {
        //       // this.alertService.error(error);

        //     }
        //   });
      }
      else if (params.deleteLink == "LITYIT") {
        //debugger;
        this.listTypeService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              } else {
                this.notificationService.showInfo(data.resultMessage, "Info");
              }
            },
            error: () => {
              // this.alertService.error(error);

            }
          });
      }
      else if (params.deleteLink == "ELEMENT") {
        //debugger; [KG]
        // this.prevchklocpartelementService.delete(params.value)
        //   .pipe(first())
        //   .subscribe({
        //     next: (data: any) => {
        //       if (data.result) {
        //         this.notificationService.showSuccess(data.resultMessage, "Success");
        //         const selectedData = params.api.getSelectedRows();
        //         params.api.applyTransaction({ remove: selectedData });
        //       } else {
        //         this.notificationService.showInfo(data.resultMessage, "Info");
        //       }
        //     },
        //     error: () => {
        //       // this.alertService.error(error);

        //     }
        //   });
      } else if (params.deleteLink == "CNG") {
        //debugger;
        this.configService.delete(params.value)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (data.result) {
                this.notificationService.showSuccess(data.resultMessage, "Success");
                const selectedData = params.api.getSelectedRows();
                params.api.applyTransaction({ remove: selectedData });
              } else {
                this.notificationService.showInfo(data.resultMessage, "Info");
              }
            },
            error: () => {
              // this.alertService.error(error);

            }
          });
      }
    }
  }
}

import { Component } from "@angular/core";
import { first } from "rxjs/operators";
import { ICellRendererAngularComp } from "ag-grid-angular";
import {
  NotificationService,
  FileshareService,
} from "../_services";
import { HttpEventType, HttpResponse } from "@angular/common/http";

@Component({
    template: ` <button
      type="button"
      class="btn btn-link"
      (click)="download(params)"
    >
      <span class="icon-btn icon-download" title="Download"></span>
    </button>

    <button class="btn btn-link" *ngIf="params.deleteaccess" type="button"
     (click)="delete(params)">
      <span class="icon-btn icon-delete" title="Delete"></span>
    </button>`,
    standalone: false
})
export class FilerendercomponentComponent implements ICellRendererAngularComp {
  params: any;
  constructor(
    private fileService: FileshareService,
    private notificationService: NotificationService
  ) { }


  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }

  delete(params) {
    this.fileService
      .delete(params.value)
      .pipe(first())
      .subscribe({
        next: (data) => {
          if (data) {
            this.refresh(params);

            this.notificationService.showSuccess("File Deleted", "Success");
            params.api.applyTransaction({ remove: [params.data] });
          }
        },
        error: (error) => {
          
        },
      });
  }

  download(params: any) {
    this.fileService.download(this.params.value).subscribe((event) => {
      if (event.type === HttpEventType.Response) {
        this.downloadFile(event);
      }
    });
  }

  private downloadFile(data: HttpResponse<Blob>) {
    const downloadedFile = new Blob([data.body], { type: data.body.type });
    const a = document.createElement("a");
    a.setAttribute("style", "display:block;");
    document.body.appendChild(a);
    a.download = this.params.data.displayName;
    a.href = URL.createObjectURL(downloadedFile);
    a.innerHTML = this.params.data.displayName;
    a.target = "_blank";
    a.click();
    document.body.removeChild(a);
  }
}

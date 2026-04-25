import { HttpEventType, HttpResponse } from "@angular/common/http";
import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { first } from "rxjs/operators";
import { FileshareService } from "../_services";
import { OfferRequestProcessesService } from "../_services/offer-request-processes.service";

@Component({
    selector: "app-ProcessFileRenderer",
    templateUrl: "./downloadFile.html",
    standalone: false
})
export class OfferRequeestProcessFileRenderer implements OnInit, OnChanges {
    list: any[] = []
    @Input() parameters: any;

    constructor(
        private FileShareService: FileshareService,
    ) { }

    ngOnInit(): void {
        this.loadFileList();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['parameters']) {
            this.loadFileList();
        }
    }

    private loadFileList(): void {
        if (!this.parameters) {
            this.list = [];
            return;
        }

        const id = this.parameters.id || this.parameters.stageId;
        if (!id) {
            console.warn('OfferRequeestProcessFileRenderer: No valid ID found for file loading', this.parameters);
            this.list = [];
            return;
        }

        this.FileShareService.list(id)
            .pipe(first())
            .subscribe(
                (data: any) => {
                    this.list = (data && (data.data || data.object)) ? (data.data || data.object) : [];
                },
                (error: any) => {
                    console.error('Error loading files for ID:', id, error);
                    this.list = [];
                }
            );
    }

    download(params: any, name: any) {
        this.FileShareService.download(params).subscribe((event) => {
            if (event.type === HttpEventType.Response) {
                this.downloadFile(event, name);
            }
        });
    }

    private downloadFile(data: HttpResponse<Blob>, name: any) {
        const downloadedFile = new Blob([data.body], { type: data.body.type });
        const a = document.createElement("a");
        a.setAttribute("style", "display:block;");
        document.body.appendChild(a);
        a.download = name;
        a.href = URL.createObjectURL(downloadedFile);
        a.innerHTML = this.parameters.fileUrl;
        a.target = "_blank";
        a.click();
        document.body.removeChild(a);
    }
}
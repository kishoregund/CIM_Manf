import { HttpEventType, HttpResponse } from "@angular/common/http";
import { Component, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { first } from "rxjs/operators";
import { FileshareService } from "../_services";
import { FileRenderProcessesService } from "../_services/filerenderprocesses.service";

@Component({
    selector: "app-ProcessFileRenderer",
    templateUrl: "./downloadFile.html",
    standalone: false
})
export class ProcessFileRenderer implements OnInit, OnChanges {
    list: any[] = []
    @Input() parameters: any;

    constructor(
        private FileShareService: FileshareService,
    ) { }

    ngOnInit(): void {
        this.loadFileList();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['parameters'] && this.parameters) {
            this.loadFileList();
        }
    }

    private loadFileList(): void {
        debugger;
        if (this.parameters && this.parameters.id) {
            this.FileShareService.list(this.parameters.id)
                .pipe(first())
                .subscribe(
                    (data: any) => { 
                        debugger;
                        this.list = data.data || [];
                    },
                    (error: any) => {
                        console.error('Error loading files:', error);
                        this.list = [];
                    }
                );
        }
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
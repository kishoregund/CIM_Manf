import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AgRendererComponent } from "ag-grid-angular";
import { first } from "rxjs/operators";
import { ListTypeItem, ProfileReadOnly, ServiceRequest, ticketsAssignedHistory } from "../_models";
import { ListTypeService, NotificationService, ProfileService } from "../_services";
import { DistributorService } from "../_services/distributor.service";
import { ServiceRequestService } from "../_services/serviceRequest.service";
import { SRAssignedHistoryService } from "../_services/srassignedhistory.service";

@Component({
    template: `
    
    <form [formGroup]="Form" (ngSubmit)="onSubmit()">
<div class="row">
<div class="col-md-10">
<select formControlName="assignedTo" class="form-select">
        <option *ngFor="let c of appendList" value={{c.id}}> {{c.firstName}} {{c.lastName}} </option>
        </select>
</div>   
<div class="col-md-2">
<button type="submit" *ngIf="hasUpdate && this.isGenerateReport == false" class="btn"> <i class="fas fa-save" title="save"></i></button>
</div>
</div>
</form>
`
})
export class ServiceRComponent implements AgRendererComponent, OnInit {
    params: any;
    appendList: any;
    Form: FormGroup;
    statuslist: any;
    hasUpdate: boolean = false;
    profilePermission: ProfileReadOnly;
    isGenerateReport: boolean = false;
    engineerid: any;
    srAssignedHistory: any;

    constructor(
        private distributorService: DistributorService,
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
        private serviceRequest: ServiceRequestService,
        private listTypeService: ListTypeService,
        private profileService: ProfileService,
        private srAssignedHistoryService: SRAssignedHistoryService,

    ) {
    }

    agInit(params: any): void {
        // //debugger;
        this.params = params;

    }
    ngOnInit(): void {
        this.Form = this.formBuilder.group({
            sDate: [""],
            eDate: [""],
            serReqNo: ['', Validators.required],
            distId: ['', Validators.required],
            custId: [''],
            statusId: [''],
            stageId: [''],
            siteId: [''],
            assignedTo: [''],
            serReqDate: ['', Validators.required],
            visitType: ['', Validators.required],
            companyName: ['', Validators.required],
            requestTime: ['', Validators.required],
            siteName: [''],
            country: ['', Validators.required],
            contactPerson: ['', Validators.required],
            email: ['', Validators.required],
            operatorName: [''],
            operatorNumber: [''],
            operatorEmail: [''],
            machModelName: [''],
            machinesNo: ['', Validators.required],
            machEngineer: [''],
            xrayGenerator: [''],
            breakdownType: ['', Validators.required],
            isRecurring: [false],
            recurringComments: [''],
            breakoccurDetailsId: ['', Validators.required],
            alarmDetails: [''],
            resolveAction: [''],
            currentInstruStatus: ['', Validators.required],
            accepted: [false],
            serResolutionDate: [''],
            escalation: [''],
            requestTypeId: [''],
            subrequestTypeId: [],
            remarks: [''],
            isActive: [true],
            isDeleted: [false],
            engComments: this.formBuilder.group({
                nextDate: [''],
                comments: ['']
            }),
            assignedHistory: this.formBuilder.group({
                engineerName: [''],
                assignedDate: [''],
                ticketStatus: [''],
                comments: ['']
            }),
            engAction: this.formBuilder.group({
                engineerName: [''],
                actionTaken: [''],
                comments: [''],
                teamviewerRecroding: [''],
                actionDate: ['']
            })
        });
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SRREQ");
            if (profilePermission.length > 0) {
                this.hasUpdate = profilePermission[0].update;
            }
        }
        this.listTypeService.getById('SRQST')
            .pipe(first())
            .subscribe({
                next: (data: any) => {
                    this.statuslist = data.data;
                },
                error: error => {

                }
            });

        this.Form.patchValue(this.params.data)
        this.Form.get('assignedTo').setValue(this.params.value)
        this.engineerid = this.params.data.assignedTo;

        this.distributorService.getDistributorRegionContacts(this.params.data.distId, "Engineer")
            .pipe(first())
            .subscribe((data: any) => {
                debugger;
                this.appendList = data.data;
            });
        setTimeout(() => {
            if (this.params.data.isReportGenerated || this.params.data.lockRequest) {
                this.Form.disable()
                this.isGenerateReport = true;
            }
        }, 100);

    }

    addAssignedHistory(sr: ServiceRequest) {
        if (this.engineerid != null && this.engineerid != sr.assignedTo && this.isGenerateReport == false) {

            this.srAssignedHistory = new ticketsAssignedHistory;
            this.srAssignedHistory.engineerId = this.engineerid;
            this.srAssignedHistory.serviceRequestId = sr.id;
            this.srAssignedHistory.ticketStatus = "INPRG";
            this.srAssignedHistory.assignedDate = new Date()

            this.srAssignedHistoryService.save(this.srAssignedHistory)
                .pipe(first())
                .subscribe({
                    next: (data: any) => {
                        if (data.isSuccessful) {
                            // this.notificationService.showSuccess(data.resultMessage, "Success");
                            this.notificationService.filter("itemadded");
                        } else {

                        }
                    },
                });
        }
    }

    onSubmit() {
        if (this.isGenerateReport == false) {
            let srrqData = this.params.data
            srrqData.createdOn = new Date
            srrqData.accepted == "Accepted" ? srrqData.accepted = true : srrqData.accepted = false;
            srrqData.assignedTo = this.Form.get('assignedTo').value;

            let status = this.statuslist.find(x => x.listTypeItemId == this.Form.get('statusId').value)?.itemCode
            if (status == "NTASS" && this.Form.get('assignedTo').value != null && this.Form.get('assignedTo').value != "") {
                srrqData.statusid = (this.statuslist.find(x => x.itemCode == "ASSGN")?.listTypeItemId)
            }

            srrqData.scheduledCalls = []
            srrqData.engComments = []
            this.serviceRequest.update(srrqData.id, srrqData)
                .pipe(first())
                .subscribe((data: any) => {
                    if (data.isSuccessful) {
                        this.addAssignedHistory(srrqData)
                        this.notificationService.showSuccess(data.messages[0], "Success")
                        this.notificationService.filter("itemadded");
                    }
                })
        }
    }
    refresh(params: any): boolean {
        return false;
    }
}
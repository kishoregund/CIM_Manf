import { DatePipe, DecimalPipe } from "@angular/common";
import { HttpEventType } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { first } from "rxjs/operators";
import { GetParsedDate } from "../_helpers/Providers";
import { ListTypeItem, ProfileReadOnly, User } from "../_models";
import { ListTypeService, CurrencyService, NotificationService, FileshareService, AccountService, ProfileService } from "../_services";
import { ImportdataService } from "../_services/importdata.service";
import { TravelExpenseitemService } from "../_services/travel-expenseitem.service";
import { UserDetails } from "../_newmodels/UserDetails";

@Component({
    selector: 'app-travelexpenseitem',
    templateUrl: './travelexpenseitem.component.html',
})

export class TravelexpenseItemComponent implements OnInit {

    profilePermission: ProfileReadOnly;
    hasReadAccess: boolean = false;
    hasUpdateAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    hasAddAccess: boolean = false;
    user: UserDetails;
    form: any

    @Output() GrandCompanyTotal = new EventEmitter<number>();
    @Output() GrandEngineerTotal = new EventEmitter<number>();
    @Output() public onUploadFinished = new EventEmitter();

    @Input() ParentId: string
    @Input() StartDate: any
    @Input() EndDate: any
    @Input() isDisabled: boolean = true

    @ViewChild('itemFiles') itemFiles

    datepipe = new DatePipe('en-US')
    itemList: any[] = []
    processFile: any;
    progress: number;
    file: any;
    transaction: number;
    hastransaction: boolean;
    attachments: any;
    natureOfExpense: any[] = [];
    currencyList: any[] = [];
    submitted: boolean = false;
    lstExpenseBy: any;

    constructor(
        private TravelExpenseItemService: TravelExpenseitemService,
        private listTypeService: ListTypeService,
        private currencyService: CurrencyService,
        private notificationService: NotificationService,
        private formBuilderService: FormBuilder,
        private FileShareService: FileshareService,
        private accountService: AccountService,
        private profileService: ProfileService,
        private helperService: ImportdataService,
        private numberPipe: DecimalPipe
    ) {

        this.notificationService.listen().subscribe((m: any) => {
            this.TravelExpenseItemService.getAll(this.ParentId).pipe(first())
                .subscribe((stageData: any) => {
                    stageData.data.forEach(element => {
                        element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
                    });
                    this.itemList = stageData.data;
                    this.form.reset()
                    this.itemFiles.nativeElement.value = "";
                    var selectedfiles = document.getElementById("expFilesList");
                    selectedfiles.innerHTML = '';
                    this.form.get('travelExpenseId').value = this.ParentId

                    var EngTotal = 0
                    var CompTotal = 0

                    var CompExp = this.lstExpenseBy.find((x: ListTypeItem) => x.itemCode == "COMPN")
                    var EngExp = this.lstExpenseBy.find((x: ListTypeItem) => x.itemCode == "ENGNR")
                    stageData.data.forEach((element: any) => {
                        if (element.expenseBy == CompExp.listTypeItemId) CompTotal += element.usdAmt
                        else if (element.expenseBy == EngExp.listTypeItemId) EngTotal += element.usdAmt

                        element.bcyAmt = this.numberPipe.transform(element.bcyAmt)
                        element.usdAmt = this.numberPipe.transform(element.usdAmt)
                    });
                    this.GrandCompanyTotal.emit(CompTotal)
                    this.GrandEngineerTotal.emit(EngTotal)
                })
        })

    }
    ngOnInit(): void {
        this.transaction = 0;
        this.user = this.accountService.userValue;

        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter((x) => x.screenCode == "TREXP");
            if (profilePermission.length > 0) {
                this.hasReadAccess = profilePermission[0].read;
                this.hasAddAccess = profilePermission[0].create;
                this.hasDeleteAccess = profilePermission[0].delete;
                this.hasUpdateAccess = profilePermission[0].update;
            }
        }

        this.listTypeService.getById("NOEXP").pipe(first())
            .subscribe((data: any) => this.natureOfExpense = data.data);

        this.listTypeService.getById("EXINB").pipe(first())
            .subscribe((data: any) => this.lstExpenseBy = data.data);


        this.currencyService.getAll().pipe(first())
            .subscribe((data: any) => this.currencyList = data.data)


        this.form = this.formBuilderService.group({
            expDate: [""],
            expNature: [""],
            expDetails: [""],
            isBillsAttached: false,
            currency: [""],
            bcyAmt: [""],
            usdAmt: [""],
            remarks: [""],
            travelExpenseId: "",
            expenseBy: ''
        });

        if (this.ParentId != null) {
            this.TravelExpenseItemService.getAll(this.ParentId).pipe(first())
                .subscribe((data: any) => {
                    setTimeout(() => {
                        this.itemList = data.data
                        var EngTotal = 0
                        var CompTotal = 0

                        var CompExp = this.lstExpenseBy.find((x: ListTypeItem) => x.itemCode == "COMPN")
                        var EngExp = this.lstExpenseBy.find((x: ListTypeItem) => x.itemCode == "ENGNR")
                        if (data.data != null) {
                            data.data.forEach((element: any) => {
                                if (element.expenseBy == CompExp.listTypeItemId) CompTotal += element.usdAmt
                                else if (element.expenseBy == EngExp.listTypeItemId) EngTotal += element.usdAmt

                                element.bcyAmt = this.numberPipe.transform(element.bcyAmt)
                                element.usdAmt = this.numberPipe.transform(element.usdAmt)
                            });
                        }
                        this.GrandCompanyTotal.emit(CompTotal)
                        this.GrandEngineerTotal.emit(EngTotal)
                    }, 500);
                })

            this.form.get('travelExpenseId').value = this.ParentId
        }
    }

    refreshStages() {
        this.notificationService.filter("itemadded");
    }

    DisableChoseFile() {
        debugger;
        let hasNoAttachment = this.form.get('isBillsAttached').value;
        let ofer = <HTMLInputElement>document.querySelector(`input[type="file"].` + "expItemFilesList_class")
        ofer.disabled = !hasNoAttachment;// !ofer.disabled
        this.processFile = null;
        this.file = null;

        this.itemFiles.nativeElement.value = "";
    }


    submitStageData() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        let hasNoAttachment = this.form.get('isBillsAttached').value

        if (!hasNoAttachment && this.processFile == null) return this.notificationService.showInfo("No Attachments Selected.", "Error")
        this.form.get('expDate').setValue(this.datepipe.transform(GetParsedDate(this.form.get('expDate').value), 'dd/MM/YYYY'))



        if (GetParsedDate(this.form.get('expDate').value) < GetParsedDate(this.StartDate)) {
            return this.notificationService.showInfo("Expense Date should be between Start Date and End Date", "Error")
        }

        if (GetParsedDate(this.form.get('expDate').value) > GetParsedDate(this.EndDate)) {
            return this.notificationService.showInfo("Expense Date should be between Start Date and End Date", "Error")
        }

        if (!isNaN(this.form.get('bcyAmt').value) && this.form.get('bcyAmt').value > 0 && this.form.get('usdAmt').value == "") {
            var cur = this.currencyList.find(x => x.id == this.form.get('currency').value)?.code
            this.helperService.convertCurrency(cur, this.form.get('bcyAmt').value).pipe(first())
                .subscribe((data: any) => {
                    this.form.get('usdAmt').setValue(data.from[0].mid)
                    this.save(hasNoAttachment)
                })
        }
        else this.save(hasNoAttachment)

    }

    save(hasNoAttachment) {
        this.TravelExpenseItemService.save(this.form.value).pipe(first())
            .subscribe((data: any) => {
                //this.DisableChoseFile()
                if (this.processFile != null && !hasNoAttachment)
                    this.uploadFile(this.processFile, data.data);

                this.processFile = null;
                this.notificationService.filter("itemadded");
                // if (data.data != null) {
                //     data.data.forEach(element => {
                //         element.createdOn = this.datepipe.transform(element.createdOn, 'MM/dd/yyyy')
                //     });
                // }
                this.itemList = data.data
            })

    }

    CalculateDateDiff(startDate, endDate) {
        let currentDate = new Date(startDate);
        let dateSent = new Date(endDate);

        return Math.floor(
            (Date.UTC(
                dateSent.getFullYear(),
                dateSent.getMonth(),
                dateSent.getDate()
            ) -
                Date.UTC(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate()
                )) /
            (1000 * 60 * 60 * 24)
        );
    }


    deleteProcess(id) {
        this.TravelExpenseItemService.delete(id).pipe(first())
            .subscribe((data: any) => this.notificationService.filter("itemadded"))
    }

    get f() {
        return this.form.controls
    }

    getfil = (x) => this.processFile = x


    listfile = (x, lstId = "selectedfiles") => {
        document.getElementById(lstId).style.display = "block";

        var selectedfiles = document.getElementById(lstId);
        var ulist = document.createElement("ul");
        ulist.id = "demo";
        ulist.style.width = "max-content"
        selectedfiles.appendChild(ulist);

        if (this.transaction != 0) {
            document.getElementById("demo").remove();
        }

        this.transaction++;
        this.hastransaction = true;

        for (let i = 0; i < x.length; i++) {
            var name = x[i].name;
            // var ul = document.getElementById("demo");
            ulist.style.marginTop = "5px"
            var node = document.createElement("li");
            node.style.wordBreak = "break-word";
            node.style.width = "300px"
            node.appendChild(document.createTextNode(name));
            ulist.appendChild(node);
        }
    };

    uploadFile = (files: any, id: any, code = "TRVEXP_ITMS") => {
        if (files.length === 0) {
            return;
        }

        let filesToUpload: File[] = files;
        const formData = new FormData();

        Array.from(filesToUpload).map((file, index) => {
            return formData.append("file" + index, file, file.name);
        });

        this.FileShareService.upload(formData, id, code).subscribe((event) => {
            if (event.type === HttpEventType.UploadProgress) {
                this.progress = Math.round((100 * event.loaded) / event.total);
                if (this.progress == 100)
                    this.notificationService.filter("itemadded");
            }
            else if (event.type === HttpEventType.Response) {
                this.notificationService.filter("itemadded");
                this.onUploadFinished.emit(event.body);
            }
        });
    };

    GetFileList(id: string) {
        this.FileShareService.list(id)
            .pipe(first()).subscribe((data: any) => {
                this.attachments = data.data;
            });
    }


}
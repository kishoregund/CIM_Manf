import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { first } from "rxjs/operators";
import { RenderComponent } from "../distributor/rendercomponent";
import { ProfileReadOnly, User } from "../_models";
import { AccountService, ProfileService } from "../_services";
import { TravelinvoiceService } from "../_services/travelinvoice.service";
import { UserDetails } from "../_newmodels/UserDetails";
import { BUBrandModel } from "../_newmodels/BUBrandModel";

@Component({
    selector: 'app-travelexpense',
    templateUrl: './travelinvoicelist.component.html',
})

export class TravelInvoiceListComponent implements OnInit {

    public columnDefs: ColDef[];
    private columnApi: ColumnApi;
    private api: GridApi;
    profilePermission: ProfileReadOnly;
    hasReadAccess: boolean = false;
    hasUpdateAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    hasAddAccess: boolean = false;
    user: UserDetails;
    buBrandModel: BUBrandModel;
    List: any;
    constructor(
        private router: Router,
        private accountService: AccountService,
        private Service: TravelinvoiceService,
        private profileService: ProfileService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.user = this.accountService.userValue;
        let role;
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(
                (x) => x.screenCode == "TRINV"
            );
            if (profilePermission.length > 0) {
                this.hasReadAccess = profilePermission[0].read;
                this.hasAddAccess = profilePermission[0].create;
                this.hasDeleteAccess = profilePermission[0].delete;
                this.hasUpdateAccess = profilePermission[0].update;
            }
        }
        if (this.user.isAdmin) {
            this.hasAddAccess = false;
            this.hasDeleteAccess = true;
            this.hasUpdateAccess = true;
            this.hasReadAccess = true;
        } else {
            role = JSON.parse(sessionStorage.getItem('segments'));
            role = role[0].itemCode;
        }
        this.buBrandModel = new BUBrandModel();
        this.buBrandModel.businessUnitId = this.user.selectedBusinessUnitId;
        this.buBrandModel.brandId = this.user.selectedBrandId;
        this.Service.getAll(this.buBrandModel).pipe(first())
            .subscribe((data: any) => this.List = data.data)

        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(["travelinvoice"], {
            queryParams: {
                isNSNav: false
            },// remove to replace all query params by provided
        });
    }

    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`travelinvoice/${data.id}`], {
            queryParams: {
                isNSNav: true
                //creatingNewDistributor: true
            },
        })
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Engineer ",
                field: "engineerName",
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: "name",
            },
            {
                headerName: "Service Request No",
                field: "serviceRequestNo",
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: "code",
            },
            {
                headerName: "Amount Build",
                field: "amountBuild",
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: "code",
            },
        ];
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.api.sizeColumnsToFit();
    }
}
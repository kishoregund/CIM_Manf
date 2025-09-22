import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Amc, User } from "../_models";
import { AccountService } from "../_services";
import { UserDetails } from "../_newmodels/UserDetails";
import { TenantService } from "../_services/tenant.service";

@Component({
    selector: "CreateTenant",
    templateUrl: "./tenantlist.component.html"
})

export class TenantListComponent implements OnInit {

    user: UserDetails;
    TenantList: any;
    hasAddAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    public columnDefs: any
    private columnApi: ColumnApi;
    private api: GridApi;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private tenantService: TenantService,
        private route: ActivatedRoute
    ) { }

    async ngOnInit() {
        this.user = this.accountService.userValue;

        if (this.user.isAdmin) {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
        }


        this.tenantService.GetAll().pipe()
        .subscribe((data: any) => {
            console.log(data);
            this.TenantList = data.data;
            this.columnDefs = this.createColumnDefs();
        });        
    }

    Add() {
        this.router.navigate(['tenant'],
            {
                queryParams: {
                    isNSNav: false
                },// remove to replace all query params by provided
            });
    }


    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`tenant/${data.id}`], {
            queryParams: {
                isNSNav: true
            }
        });
    }

    private createColumnDefs() {
        return [
            {
                headerName: 'Tenant',
                field: 'name',
                filter: true,
                sortable: true,
                tooltipField: "name",
            },
            {
                headerName: 'Valid UpTo',
                field: 'validUpTo',
                filter: true,
                sortable: true,
                tooltipField: "validUpTo",
            },
            {
                headerName: 'Active',
                field: 'isActive',
                filter: true,
                sortable: true,
                tooltipField: "isActive",
            },
        ]
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.api.sizeColumnsToFit();
    }
}

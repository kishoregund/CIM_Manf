import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Amc, User } from "../_models";
import { AccountService } from "../_services";
import { BrandService } from "../_services/brand.service";
import { UserDetails } from "../_newmodels/UserDetails";

@Component({
    selector: "CreateBrand",
    templateUrl: "./brandlist.component.html"
})

export class BrandListComponent implements OnInit {

    user: UserDetails;
    BrandList: any;
    hasAddAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    public columnDefs: any
    private columnApi: ColumnApi;
    private api: GridApi;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private BrandService: BrandService,
        private route: ActivatedRoute
    ) { }

    async ngOnInit() {
        this.user = this.accountService.userValue;

        if (this.user.isAdmin) {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
        }

        debugger;
        var data: any = await this.BrandService.GetAll().toPromise()

        this.BrandList = data.data;
        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(['brand'],
            {
                queryParams: {
                    isNSNav: false
                },// remove to replace all query params by provided
            });

    }


    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`brand/${data.id}`], {
            queryParams: {
                isNSNav: true
            }
        });
    }

    private createColumnDefs() {
        return [            
            {
                headerName: 'Business Unit',
                field: 'businessUnitName',
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: 'businessUnitName',
                width: "640"
            },
            {
                headerName: 'Brand Name',
                field: 'brandName',
                filter: true,
                sortable: true,
                tooltipField: "brandName",
                width: "640"
            },
        ]
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }

}

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ColDef,  GridApi } from "ag-grid-community";
import { Amc, User } from "../_models";
import { AccountService } from "../_services";
import { UserDetails } from "../_newmodels/UserDetails";
import { ManfBusinessUnitService } from "../_services/manfbusinessunit.service";

@Component({
    selector: "CreateManfBusinessUnit",
    templateUrl: "./manfbusinessunitlist.component.html",
    standalone: false
})

export class ManfBusinessUnitListComponent implements OnInit {

    user: UserDetails;
    BusinessUnitList: any;
    loading = false;
    hasAddAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    public columnDefs: any
    
    private api: GridApi;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private BusinessUnitService: ManfBusinessUnitService,
        private route: ActivatedRoute
    ) { }

    async ngOnInit() {
        this.user = this.accountService.userValue;

        if (this.user.isAdmin) {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
        }


        this.loading = true;
        this.BusinessUnitService.GetAll().pipe()
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.BusinessUnitList = data.data;
            this.columnDefs = this.createColumnDefs();
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
          }
        });        
    }

    Add() {
        this.router.navigate(['manfbusinessunit'],
            {
                queryParams: {
                    isNSNav: false
                },// remove to replace all query params by provided
            });
    }


    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`manfbusinessunit/${data.id}`], {
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
                sortable: true,
                tooltipField: "businessUnitName",
                 width: "1280"
            },
        ]
    }

    onGridReady(params): void {
        this.api = params.api;
        
        this.api.sizeColumnsToFit();
    }
}

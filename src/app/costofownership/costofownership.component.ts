import { DatePipe } from '@angular/common';
import { AfterContentChecked, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { NotificationService } from '../_services';
import { CustomerdashboardService } from '../_services/customerdashboard.service';

@Component({
  selector: 'app-costofownership',
  templateUrl: './costofownership.component.html',
})
export class CostofownershipComponent implements OnInit {
  @Input() instrumentId: string;
  costOfInstrument: number = 0;
  dateOfPurchased: Date | string;
  insSerialNo: string;
  ownerShip: any[] = []
  insCostCurrency:string;

  constructor(
    private customerDashboard: CustomerdashboardService,
    public activeModal: BsModalService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }
  // ngAfterContentChecked(): void {

  // }

  ngOnInit(): void {
    // this.instrumentId = this.route.snapshot.paramMap.get('id');
    this.customerDashboard.GetCostOfOwnerShip(this.instrumentId)
      .pipe(first()).subscribe((data: any) => {
        this.insSerialNo = data.data.insSerialNo;
        this.costOfInstrument = data.data.insCost;
        this.dateOfPurchased = data.data.dateOfPurchase;
        this.ownerShip = data.data.ownerShip;
        this.insCostCurrency = data.data.insCostCurrency;
      })
  }


  close() {
    //alert('test cholde');
    this.activeModal.hide();
    this.notificationService.filter("itemadded");
  }

}

export class ServiceReport {
  id: string;
  customer: string;
  srOf: string;
  department: string;
  country: string;
  town: string;
  instrument: string;
  instrumentId: any;
  respInstrumentId: string;
  labChief: string;
  computerArlsn: string;
  software: string;
  brandId: string;
  firmaware: string;
  installation: boolean;
  analyticalAssit: boolean;
  prevMaintenance: boolean;
  corrMaintenance: boolean;
  problem: string;
  workCompletedStr: string;
  workFinishedStr: string;
  interruptedStr: string;
  workCompleted: boolean;
  workFinished: boolean;
  interrupted: boolean;
  reason: string;
  nextVisitScheduled: string;
  engineerComments: string;
  signEngName: string;
  engSignature: string;
  signCustName: string;
  custSignature: string;
  createdOn: string;
  rework: boolean;
  serviceRequestId: string;
  departmentName: string;
}

export class workDone {
  id: string;
  workDone: string;
  serviceReportId: string;
}

export class workTime {
  id: string;
  workTimeDate: string;
  startTime: string;
  endTime: string;
  perDayHrs: string;
  totalHrs: string;
  totalDays: string;
  serviceReportId: string;
}

export class sparePartsConsumed {
  id: string
  sparepartId: string;
  serviceReportId: string;
  hscCode: string;
  partNo: string;
  itemDesc: string;
  configValue: string;
  configType: string;
  qtyConsumed: any;
  qtyAvailable: string;
  customerSPInventoryId : string;
}

export class sparePartRecommended {
  sparepartId: string;
  serviceReportId: string;
  hscCode: string;
  qtyRecommended: any;
  partNo: string;
  itemDesc: string;
  configValue: string;
  configType: string;
  id: string;
}

export class custSPInventory {
  hSCCode: string;
  qtyAvailable: number;
  partNo: string;
  configValue: string;
  configType: string;
  customerId: string;
  customerName: string;
  id: string;
}

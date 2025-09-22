export class Amc {
  id: string;
  isActive: boolean | string;
  billTo: string;
  serviceQuote: string;
  sqDate: string;
  sDate: string;
  eDate: string;
  project: string;
  serviceType: string;
  brand: string;
  currency: string;
  zerorate: number;
  conversionAmount:number;
  tnc: string;
  paymentTerms: any;
  firstVisitDateFrom: string;
  secondVisitDateFrom: string;
  firstVisitDateTo: string;
  secondVisitDateTo: string;
  secondVisitDate: string;
  firstVisitDate: string;
  period: string;
}

export class instrumentList {
  instrumentId: string;
  part: string;
  partDesc: string;
  qty: string;
  rate: string;
  amount: string;
}

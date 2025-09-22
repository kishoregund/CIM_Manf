export class Instrument {
  id: string;
  serialNos: string;
  insMfgDt: any;
  insType: string;
  insVersion: string;
  image: string;
  // baseCurrencyId: string;
  // baseCurrencyAmt: any;
  configTypeId: string;
  configValueId: string;
  spares: InstrumentConfig[];
  businessUnitId:string;
  businessUnitName:string;
  brandId:string;
  manufId:string;
  brandName:string;
  manufName:string;
//  cost: any;
}

export class InstrumentConfig {
  configTypeId: string;
  instrumentId: string;
  id: string;
  configValueId: string;
  sparepartId: string;
  insQty: number;
}

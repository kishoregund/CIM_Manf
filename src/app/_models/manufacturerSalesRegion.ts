
export class ManufacturerSalesRegion {
  id: string;
  manfId: string;
  region: string;
  salesRegionName: string;
  countries: string | string[];
  payTerms: string;
  isBlocked: boolean;
  isActive: boolean;
  isPrincipal: boolean;
 
  street: string;
  area: string;
  place: string;
  city: string;
  addrCountryId: string;
  zip: string;
  geoLat: string;
  geoLong: string;
}

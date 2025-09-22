
export class DistributorRegion {
  id: string;
  distId: string;
  region: string;
  distRegName: string;
  countries: string | string[];
  payTerms: string;
  isBlocked: boolean;
  isActive: boolean;
  isPrincipal: boolean;
 
  street: string;
  area: string;
  place: string;
  city: string;
  countryId: string;
  zip: string;
  geoLat: string;
  geoLong: string;
}

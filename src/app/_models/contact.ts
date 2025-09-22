
export class Contact {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  primaryContactNo: string;
  primaryEmail: string;
  secondaryContactNo: string;
  whatsappNo: string;
  secondaryEmail: string;
  designationId: string;
  designation: string;
  isActive: boolean;
  
  regionId: string;
  siteId: string;
  salesRegionId: string;

  contactMapping: ContactMapping;
  
  street: string;
  area: string;
  place: string;
  city: string;
  addrCountryId: string;
  zip: string;
  geoLat: string;
  geoLong: string;
}

export class ContactMapping {
  mappedFor: string;
  parentId: string;
}

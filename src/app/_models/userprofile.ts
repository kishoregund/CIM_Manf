
export class UserProfile {
  id: string;
  userId :string;
  profileId :string;
  profileName :string;
  profileForId :string;
  profileForName :string;
  email :string;
  username :string;
  contactid :string;
  fName :string;
  lName :string;
  designation: string;
  distributorName: string;
  roleId: string;
  profileRegions: ProfileRegions
  distRegions: any;
  businessUnitIds: any;
  manfBUIds:any;
  brandIds: any;
  custSites: any;
}

export class ProfileRegions {
  id: string;
  userProfileId: string;
  select: boolean;
  level1Name :string;
  level2Name :string;
  level2Level1Name :string;
  level1id :string;
  level2id :string;
  profileRegionId :string;
}

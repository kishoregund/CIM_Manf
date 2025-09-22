export class User {
  id: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber:string;
  contactId: string;
  contactType: string;
  activation:boolean;
  // userId: string;
  // userProfileId: string;
  // roleId: string;  
  // token: string;
  // distRegionsId: string
  // custSites: string  
  // companyId: string
  // brand: string
  // bu: string
  // brandId: string
  // buId: string
  // company: string
  // parentId: string
  // childId: string
  // isAdmin: boolean
  // isSuperAdmin: boolean
}

export class AuthenticateModel {
  username: string;
  password: string;
  companyId: string;
}

export class ChangePasswordModel {
  userId: string;
  nPass: string;
  oPass: string;
}

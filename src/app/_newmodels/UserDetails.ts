import { LoginToken } from "./LoginToken";
import { User } from "./UserDto";

export class UserDetails {   
    userProfileId :string
	description:string;
	brandIds:string;
	selectedBrandId:string;
	businessUnitIds:string;
	selectedBusinessUnitId:string;
	custSites:string;
	distRegions:string;
	activeUserProfile:string;
	manfSalesRegions:string;
	profileFor:string;
	roleId:string;
	segmentId:string;
	userId:string;
	firstName:string;
	lastName:string;
	userName:string;
	email:string;
	activeUser:string;
	contactId:string;
	contactType:string;
	entityChildId:string;
	entityChildName:string;
	entityParentId:string;
	entityParentName:string;
	designation:string;
	designationId:string;
	businessUnitName:string;
	brandName:string;    
    userRole:string;
    permissions: any;
    isAdmin:boolean = false;
	company:string;
}
 
export class UserLoginResponse{
    token: LoginToken;
    userDetails: UserDetails
}


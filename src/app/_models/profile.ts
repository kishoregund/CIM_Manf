
export class Profile {
  id: string;
  profilename: string;
  Permissions: ProfilePermission[];
}

export class ProfilePermission {
  id: string;
  screenId: string;
  screenName: string;
  screenCode: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  commercial: boolean;
  privilages: string;
}


export class ProfileReadOnly {
  id: string;
  profilename: string;
  permissions: ProfilePermission[];
}

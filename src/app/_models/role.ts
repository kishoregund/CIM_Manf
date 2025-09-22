
export class Role {
  id: string;
  roleName: string;
  permissions: RoleClaims[];
}

export class RoleClaims {
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


export class RoleReadOnly {
  id: string;
  roleName: string;
  permissions: RoleClaims[];
}

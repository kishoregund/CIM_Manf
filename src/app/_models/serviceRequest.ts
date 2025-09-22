export class ServiceRequest {
  id: string;
  serReqNo: string;
  serReqDate: string;
  distributor: string;
  assignedTo: string;
  createdOn: Date;
  date: string;
  visitType: string;
  companyName: string;
  requestTime: string;
  siteName: string;
  country: string;
  contactPerson: string;
  email: string;
  operatorName: string;
  operatorNumber: string;
  operatorEmail: string;
  machModelName: string;
  machinesNo: string;
  xrayGenerator: string;
  sampleHandlingType: string;
  breakdownType: string;
  isRecurring: boolean;
  recurringComments: string;
  breakoccurDetailsId: string;
  alarmDetails: string;
  resolveAction: string;
  currentInstruStatus: string;
  compliantRegisName: string;
  registrarPhone: string;
  accepted: boolean;
  engComments: EngineerCommentList[];
  assignedHistory: ticketsAssignedHistory[];
  customerName: string;
  engAction: actionList[];
  siteId: string;
  custId: string;
  distId: string;
  machEngineer: string;
  serResolutionDate: string;
  requestTypeId: string;
  subRequestTypeId: string;
  machineModelName: string;
  isCritical: boolean;
  statusId: string;
  stageId: string;
}

export class EngineerCommentList {
  id: string;
  nextDate: string;
  comments: string;
  serviceRequestId: string;
  engineerId: string;
}

export class ticketsAssignedHistory {
  id: string;
  engineerId: string;
  engineerName: string;
  assignedDate: any;
  ticketStatus: string;
  serviceRequestId: string;
  comments: string;
}

export class actionList {
  id: string;
  engineerId: string;
  engineerName: string;
  actionTaken: string;
  comments: string;
  actionDate: string;
  teamviewRecording: string;
  serviceRequestId: string;
}

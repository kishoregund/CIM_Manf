import { createElement, Internationalization, L10n } from '@syncfusion/ej2-base';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EventSettingsModel, GroupModel, PopupOpenEventArgs, ScheduleComponent } from '@syncfusion/ej2-angular-schedule';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { first } from "rxjs/operators";
import {
  AccountService,
  ListTypeService,
  NotificationService,
  ProfileService,
} from "../_services";
import { ProfileReadOnly, ServiceRequest, User } from "../_models";
import { DatePipe } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { TextBox, Input } from '@syncfusion/ej2-inputs';
import { EnvService } from '../_services/env/env.service';
import { UserDetails } from '../_newmodels/UserDetails';
import { ServiceRequestService } from '../_services/serviceRequest.service';
import { EngSchedulerService } from '../_services/engscheduler.service';
import { DistributorService } from '../_services/distributor.service';

L10n.load({
  'en-US': {
    'schedule': {
      'saveButton': 'Add',
      'cancelButton': 'Close',
      'deleteButton': 'Remove',
      'newEvent': 'Add Event',
    },
  }
});

@Component({
  selector: 'app-engineerscheduler',
  templateUrl: './engineerscheduler.component.html'
})

export class EngineerSchedulerComponent implements OnInit {

  srEngList: ServiceRequest[];
  loading = false;
  user: UserDetails;
  dataSrc = [];
  @ViewChild("scheduleObj")
  public scheduleObj: ScheduleComponent;
  private distId: any;
  public setView = "WorkWeek";
  isEng: boolean = false;
  isDistSupp: boolean = false;

  profilePermission: ProfileReadOnly;
  hasReadAccess: boolean = false;
  hasUpdateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasAddAccess: boolean = false;
  isAdmin: boolean = false;
  id: string;
  link: string;
  DistData: any[];
  public ownerDataSource: Object[] = JSON.parse(sessionStorage.getItem('ownerDataSrc'))
  public eventSettings: EventSettingsModel
  public views: Array<string> = ['Week', 'Month'];
  public group: GroupModel = {
    resources: ['Owners']
  };
  isRemoteDesktop: boolean;

  constructor(
    private serviceRequestService: ServiceRequestService,
    private notificationService: NotificationService,
    private accountService: AccountService,
    private EngschedulerService: EngSchedulerService,
    private distributorService: DistributorService,
    private listTypeService: ListTypeService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private environment: EnvService,

  ) {
  }

  // public eventSettings: EventSettingsModel;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isRemoteDesktop = this.route.snapshot.queryParams?.action == "RMD"

    this.link = `/servicerequest/${this.id}`
    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;
    if (this.profilePermission != null) {
      let profilePermission = this.profilePermission.permissions.filter(x => x.screenCode == "SCDLE");
      if (profilePermission.length > 0) {
        this.hasReadAccess = profilePermission[0].read;
        this.hasAddAccess = profilePermission[0].create;
        this.hasDeleteAccess = profilePermission[0].delete;
        this.hasUpdateAccess = profilePermission[0].update;
      }
    }

    if (this.user.isAdmin) {
      this.hasAddAccess = true;
      this.hasDeleteAccess = true;
      this.hasReadAccess = true;
      this.hasUpdateAccess = true;
      this.isAdmin = true;
    }


    this.listTypeService.getById("SEGMENTS")
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          data = data.data.filter(x => x.listTypeItemId == this.user.roleId)[0]
          if (data?.itemCode == this.environment.engRoleCode) {
            this.isEng = true
          } else if (data?.itemCode == this.environment.distRoleCode) {
            this.isDistSupp = true
          }
          if (this.isEng) {
            this.isEng = true;
            this.EngschedulerService.getByEngId(this.user.contactId)
              .pipe(first())
              .subscribe({
                next: (Engdata: any) => {
                  Engdata.data = Engdata.data.filter(x => x.engId === this.user.contactId)
                  if (Engdata.isSuccessful && Engdata.data.length > 0 && Engdata.data != null) {
                    Engdata.data.forEach(x => {
                      let obj = {
                        Id: x.id,
                        Subject: x.displayName,
                        Location: x.location,
                        StartTime: new Date((x.startTime)),
                        EndTime: new Date((x.endTime)),
                        IsAllDay: x.isAllDay,
                        IsBlock: false,
                        IsReadonly: this.id == x.serReqId ? false : true,
                        RoomId: x.roomId,
                        ResourceId: x.resourceId,
                        Description: x.description,
                        SerReqId: x.serReqId,
                        ActionId: x.actionId,
                        RecurrenceRule: x.recurrenceRule,
                        RecurrenceException: x.RecurrenceException,
                        StartTimezone: x.StartTimezone,
                        EndTimezone: x.EndTimezone,
                      };
                      this.dataSrc.push(obj);
                    })
                    this.eventSettings = {

                      dataSource: this.dataSrc,
                      fields: {
                        id: 'Id',
                        subject: { name: 'Subject' },
                        location: { name: 'Location' },
                        description: { name: 'Description' },
                        startTime: { name: 'StartTime' },
                        endTime: { name: 'EndTime' },

                      }
                    };
                  }
                }
              })
          } else if (this.isDistSupp) {
            this.isDistSupp = true;
            this.DistData = [];
            this.distributorService.GetDistributorRegionContactsByContactId(this.user.contactId)
              .pipe(first())
              .subscribe({
                next: (Distdata: any) => {
                  if (Distdata.isSuccessful && Distdata.data != null) {
                    let owerner = []
                    Distdata.data.forEach(x => {
                      this.EngschedulerService.getByEngId(x.id)
                        .pipe(first())
                        .subscribe({
                          next: (engSch: any) => {
                            if (engSch.data != null && engSch.data.length > 0) {
                              engSch = engSch.data;
                              engSch.forEach(y => {
                                let obj = {
                                  Id: y.id,
                                  Subject: y.displayName,
                                  Location: y.location,
                                  StartTime: new Date((y.startTime)),
                                  EndTime: new Date((y.endTime)),
                                  IsAllDay: y.isAllDay,
                                  IsBlock: false,
                                  IsReadonly: true,
                                  RoomId: y.roomId,
                                  OwnerId: y.roomId,
                                  Description: y.description,
                                  SerReqId: y.serReqId,
                                  ActionId: y.actionId,                                  
                                  RecurrenceRule: y.recurrenceRule,
                                  RecurrenceException: y.recurrenceException,
                                  StartTimezone: y.startTimezone,
                                  EndTimezone: y.endTimezone,
                                };
                                this.DistData.push(obj);
                              })
                            }
                            this.eventSettings = {
                              dataSource: this.DistData,
                            };
                          }
                        })
                      owerner.push({ OwnerText: x.firstName + " " + x.lastName, Id: x.id })
                    })

                    let owner = sessionStorage.getItem('ownerDataSrc')
                    sessionStorage.setItem('ownerDataSrc', JSON.stringify(owerner))
                    if (owner == null) {
                      window.location.reload()
                    }

                  }
                }
              })

          }

        },
        error: error => {

        }
      });
  }

  onActionBegin(e) {

    if (e.requestType == "eventCreate") {
      if (Array.isArray(e.data)) {
        e.data.forEach(x => {
          this.loading = true;
          x.Id = x.Id.toString();

          this.serviceRequestService.getById(this.id)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                data = data.data;
                let serReqDate = new Date((data.serReqDate))
                let SDate: Date = x.StartTime;
                let diff = SDate.valueOf() - serReqDate.valueOf()
                if (diff >= 0) {
                  x.StartTime = x.StartTime.toString();
                  x.EndTime = x.EndTime.toString();
                  x.EngId = this.user.contactId;
                  x.RoomId = this.user.contactId;
                  x.isActive = true;
                  x.isDeleted = true;
                  x.serReqId = this.id

                  if (this.id == null) {
                    this.notificationService.showError("Service Request Field Required", "Error")
                  }

                  this.EngschedulerService.save(x).pipe(first()).subscribe({
                    next: (data: any) => {
                      this.loading = false;
                      if (!data.isSuccessful) {
                        this.scheduleObj.deleteEvent(x)
                        this.scheduleObj.refreshEvents();

                      }
                    },
                    error: (error) => {
                      this.loading = false;
                      this.scheduleObj.deleteEvent(x)
                      this.scheduleObj.refreshEvents();

                    }
                  })

                } else {
                  this.loading = false;
                  this.notificationService.showError("Start Date Should Be greater than or Equal" +
                    " to Service Request Date", "Error")
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();
                }
              },
              error: (error: any) => {
                this.loading = false;
                this.scheduleObj.deleteEvent(x)
                this.scheduleObj.refreshEvents();

              }
            });
        })
      } else {
        let x = e.data;
        x.Id = x.Id.toString();
        if (x.SerReqId != null) {
          this.serviceRequestService.getById(x.SerReqId)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                this.loading = true;
                data = data.data;
                let serReqDate = new Date((data.serReqDate))
                let SDate: Date = x.StartTime;
                let diff = SDate.valueOf() - serReqDate.valueOf()
                if (diff >= 0) {
                  x.StartTime = x.StartTime.toString();
                  x.EndTime = x.EndTime.toString();
                  x.EngId = this.user.contactId;
                  x.RoomId = this.user.contactId;
                  x.isActive = true;
                  x.isDeleted = true;
                  x.serReqId = this.id

                  this.EngschedulerService.save(x).pipe(first()).subscribe({
                    next: (data: any) => {
                      this.loading = false;
                      if (!data.isSuccessful) {
                        this.scheduleObj.deleteEvent(x)
                        this.scheduleObj.refreshEvents();

                      }
                    },
                    error: (error) => {
                      this.loading = false;
                      this.scheduleObj.deleteEvent(x)
                      this.scheduleObj.refreshEvents();

                    }
                  })

                } else {
                  this.loading = false;
                  this.notificationService.showError("Start Date Should Be greater than or Equal" +
                    " to Service Request Date", "Error")
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();
                }
              },
              error: (error: any) => {
                this.loading = false;
                this.scheduleObj.deleteEvent(x)
                this.scheduleObj.refreshEvents();

              }
            });
        } else {
          this.notificationService.showError("Service Request Field Required", "Error")
        }
      }

    } else if (e.requestType == "eventChange") {
      this.loading = true;
      this.EngschedulerService.update(e.data.Id, e.data).pipe(first()).subscribe({
        next: (data: any) => {
          this.loading = false;
          if (!data.isSuccessful) {
            this.scheduleObj.deleteEvent(e.data)
            this.scheduleObj.refreshEvents();

          }
        },
        error: (error) => {
          this.loading = false;
          this.scheduleObj.deleteEvent(e.data)
          this.scheduleObj.saveEvent(e.data)
          this.scheduleObj.refreshEvents();

        }
      })
    } else if (e.requestType == "eventRemove") {
      if (Array.isArray(e.data)) {
        e.data.forEach(x => {
          this.loading = true;
          x.Id = x.Id.toString()
          this.EngschedulerService.delete(x.Id)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                this.loading = false;
                if (!data.isSuccessful) {
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();

                }
              },
              error: (error: any) => {
                this.loading = false;
                this.scheduleObj.saveEvent(x)
                this.scheduleObj.refreshEvents();

              }
            })
        })
      } else {
        this.loading = true;
        let x = e.data;
        x.Id = x.Id.toString()
        this.EngschedulerService.delete(x.Id)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              this.loading = false;
              if (!data.isSuccessful) {
                this.scheduleObj.deleteEvent(x)
                this.scheduleObj.refreshEvents();

              }
            },
            error: (error: any) => {
              this.loading = false;
              this.scheduleObj.saveEvent(x)
              this.scheduleObj.refreshEvents();

            }
          })
      }
    }
  }

  onPopupOpen(args: PopupOpenEventArgs): void {
    if (args.type === "QuickInfo") {
      args.element.querySelector('.e-event-save')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-event-create')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-event-details')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-subject')?.setAttribute('disabled', 'true')
    }
    if (args.type === 'EventContainer') {
      let instance: Internationalization = new Internationalization();
      let date: string = instance.formatDate((<any>args.data).date, { skeleton: 'MMMEd' });
      ((args.element.querySelector('.e-header-date')) as HTMLElement).innerText = date;
      ((args.element.querySelector('.e-header-day')) as HTMLElement).innerText = 'Event count: ' + (<any>args.data).event.length;
    } else if (args.type === 'Editor') {
      if (this.id == null) {
        args.cancel = true;
        return
      };
      if (!this.hasUpdateAccess) {
        args.element.querySelector('.e-event-save ')?.setAttribute('disabled', 'true')
      }

      if (args.data?.Id == undefined && this.isRemoteDesktop) {
        var location: HTMLInputElement = <HTMLInputElement>document.getElementsByName('Location')[0];
        location.disabled = true
        location.value = "Online"
      }

      if (!args.element.querySelector('.custom-servicereqno')) {
        let row: HTMLElement = createElement('div', { className: 'custom-servicereqno' });
        let formElement: HTMLElement = args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        let container: HTMLElement = createElement('div', { className: 'custom-field-container mt-3' });

        let inputEle: HTMLInputElement = createElement('input', { className: 'e-field e-custom-SerReqNo', attrs: { name: 'SerReqNo' } }) as HTMLInputElement;
        container.appendChild(inputEle);
        row.appendChild(container);

        Input.createInput({ element: inputEle as HTMLInputElement, floatLabelType: 'Always', properties: { placeholder: 'Service Request No.' } });

        inputEle.setAttribute('name', 'SerReqNo');
        inputEle.setAttribute('disabled', 'true');
        this.serviceRequestService.getById(this.id)
          .pipe(first())
          .subscribe((data: any) => {
            var title: HTMLInputElement = <HTMLInputElement>document.getElementsByName('Subject')[0];
            title.value = data.data.serReqNo + ": ";
            inputEle.setAttribute('value', data.data.serReqNo);
          })
      }

      else {
        this.serviceRequestService.getById(this.id)
          .pipe(first())
          .subscribe((data: any) => {
            var serreq: HTMLInputElement = <HTMLInputElement>document.getElementsByName('SerReqNo')[0];
            serreq.value = data.data.serReqNo;

            var title: HTMLInputElement = <HTMLInputElement>document.getElementsByName('Subject')[0];
            title.value = data.data.serReqNo + ": ";
          })
        if (!this.hasAddAccess) {
          args.element.querySelector('.e-event-save ')?.setAttribute('disabled', 'true')
        }
        if (!this.hasDeleteAccess) {
          args.element.querySelector('.e-event-delete ')?.setAttribute('disabled', 'true')
        }
      }
    }

  }

  onActionBeginDist(e) {
    if (e.requestType == "eventCreate") {
      if (Array.isArray(e.data)) {
        e.data.forEach(x => {
          x.Id = x.Id.toString();
          if (x.SerReqId != null) {
            this.serviceRequestService.getById(x.SerReqId)
              .pipe(first())
              .subscribe({
                next: (data: any) => {
                  data = data.data
                  let serReqDate = new Date((data.serReqDate))
                  let SDate: Date = x.StartTime;
                  let diff = SDate.valueOf() - serReqDate.valueOf()

                  if (diff >= 0) {
                    x.StartTime = x.StartTime.toString();
                    x.EndTime = x.EndTime.toString();
                    x.EngId = x.RoomId;
                    x.isActive = true;
                    x.isDeleted = false;

                    this.EngschedulerService.save(x).pipe(first()).subscribe({
                      next: (data: any) => {
                        if (!data.isSuccessful) {
                          this.scheduleObj.deleteEvent(x)
                          this.scheduleObj.refreshEvents();

                        }
                      },
                      error: (error) => {
                        this.scheduleObj.deleteEvent(x)
                        this.scheduleObj.refreshEvents();

                      }
                    })

                  } else {
                    this.notificationService.showError("Start Date Should Be greater than or Equal" +
                      " to Service Request Date", "Error")
                    this.scheduleObj.deleteEvent(x)
                    this.scheduleObj.refreshEvents();
                  }
                },
                error: (error: any) => {
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();

                }
              });
          } else {
            this.notificationService.showError("Service Request Field Required", "Error")
          }

        })
      } else {
        let x = e.data
        x.Id = x.Id.toString();
        if (x.SerReqId != null) {
          this.serviceRequestService.getById(x.SerReqId)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                data = data.data;
                let serReqDate = new Date((data.serReqDate))
                let SDate: Date = x.StartTime;
                let diff = SDate.valueOf() - serReqDate.valueOf()

                if (diff >= 0) {
                  x.StartTime = x.StartTime.toString();
                  x.EndTime = x.EndTime.toString();
                  x.EngId = x.RoomId;
                  x.isActive = true;
                  x.isDeleted = false;

                  this.EngschedulerService.save(x).pipe(first()).subscribe({
                    next: (data: any) => {
                      if (!data.isSuccessful) {
                        this.scheduleObj.deleteEvent(x)
                        this.scheduleObj.refreshEvents();

                      }
                    },
                    error: (error) => {
                      this.scheduleObj.deleteEvent(x)
                      this.scheduleObj.refreshEvents();

                    }
                  })

                } else {
                  this.notificationService.showError("Start Date Should Be greater than or Equal" +
                    " to Service Request Date", "Error")
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();
                }
              },
              error: (error: any) => {
                this.scheduleObj.deleteEvent(x)
                this.scheduleObj.refreshEvents();

              }
            });
        } else {
          this.notificationService.showError("Service Request Field Required", "Error")
        }
      }

    } else if (e.requestType == "eventChange") {

      this.EngschedulerService.update(e.data.Id, e.data)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            if (!data.isSuccessful) {
              this.scheduleObj.deleteEvent(e.data)
              this.scheduleObj.refreshEvents();

            }
          },
          error: (error) => {
            this.scheduleObj.deleteEvent(e.data)
            this.scheduleObj.saveEvent(e.data)
            this.scheduleObj.refreshEvents();

          }
        })
    } else if (e.requestType == "eventRemove") {
      if (Array.isArray(e.data)) {
        e.data.forEach(x => {
          x.Id = x.Id.toString()
          this.EngschedulerService.delete(x.Id)
            .pipe(first())
            .subscribe({
              next: (data: any) => {
                if (!data.isSuccessful) {
                  this.scheduleObj.deleteEvent(x)
                  this.scheduleObj.refreshEvents();

                }
              },
              error: (error: any) => {
                this.scheduleObj.saveEvent(x)
                this.scheduleObj.refreshEvents();

              }
            })
        })
      } else {
        let x = e.data;
        x.Id = x.Id.toString()
        this.EngschedulerService.delete(x.Id)
          .pipe(first())
          .subscribe({
            next: (data: any) => {
              if (!data.isSuccessful) {
                this.scheduleObj.deleteEvent(x)
                this.scheduleObj.refreshEvents();

              }
            },
            error: (error: any) => {
              this.scheduleObj.saveEvent(x)
              this.scheduleObj.refreshEvents();

            }
          })
      }
    }
  }

  onPopupOpenDist(args: PopupOpenEventArgs): void {
    if (args.type === "QuickInfo") {
      args.element.querySelector('.e-event-save')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-event-create')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-event-details')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-subject')?.setAttribute('disabled', 'true')
    }
    if (args.type === 'EventContainer') {
      let instance: Internationalization = new Internationalization();
      let date: string = instance.formatDate((<any>args.data).date, { skeleton: 'MMMEd' });
      ((args.element.querySelector('.e-header-date')) as HTMLElement).innerText = date;
      ((args.element.querySelector('.e-header-day')) as HTMLElement).innerText = 'Event count: ' + (<any>args.data).event.length;
      args.element.querySelector('.e-event-save')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-event-create')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-event-details')?.setAttribute('hidden', 'true')
      args.element.querySelector('.e-subject')?.setAttribute('disabled', 'true')
    } else if (args.type === 'Editor') {
      args.cancel = true;
    }

  }

  onBackclick() {
    this.notificationService.filter("itemadded");
    this.router.navigate([this.link], {
      queryParams: { isNSNav: true },
    })
  }

  //  Dist code

}

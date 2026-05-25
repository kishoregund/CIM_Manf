import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { first } from 'rxjs/operators';
import {
  AccountService,
  NotificationService,
  ProfileService,
} from '../_services';
import { UserDetails } from '../_newmodels/UserDetails';
import { EnvService } from '../_services/env/env.service';
import { ServiceRequestService } from '../_services/serviceRequest.service';
import { EngSchedulerService } from '../_services/engscheduler.service';
import { DistributorService } from '../_services/distributor.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileReadOnly } from '../_models';

@Component({
  selector: 'app-fullcalendar-scheduler',
  templateUrl: './fullcalendar-scheduler.component.html',
  styleUrls: ['./fullcalendar-scheduler.component.css'],
  standalone: false
})
export class FullcalendarSchedulerComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  user: UserDetails;
  loading = false;
  isEng = false;
  isAdmin = false;
  isDistSupp = false;

  srEngList: any[] = [];
  distData: any[] = [];
  dataSrc: any[] = [];

  selectedEvent: any = null;
  showEventModal = false;
  showCreateEventModal = false;
  isCreatingEvent = false;
  eventTitle = '';
  eventDescription = '';
  eventStartDate = '';
  eventEndDate = '';
  eventLocation = '';
  newEventErrors: { [key: string]: string } = {};
  Object = Object;

  profilePermission: ProfileReadOnly | null = null;
  hasReadAccess = false;
  hasUpdateAccess = false;
  hasDeleteAccess = false;
  hasAddAccess = false;

  id: string | null = null;
  link: string = '';
  isRemoteDesktop = false;
  actionId: any;
  dateFormat = 'dd/MM/yyyy';

  public ownerDataSource: any[] = [];
  public setView = 'Month';
  public views: Array<string> = ['Week', 'Month'];

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    height: 'auto',
    contentHeight: 'auto',
    editable: false,
    selectable: true,
    selectConstraint: 'businessHours',
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),
    events: this.dataSrc,
    eventColor: '#5ba146',
    eventTextColor: '#ffffff',
    slotLabelInterval: '00:30',
    slotDuration: '00:30',
    allDaySlot: true,
    nowIndicator: true,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '18:00'
    }
  };

  constructor(
    private accountService: AccountService,
    private notificationService: NotificationService,
    private profileService: ProfileService,
    private serviceRequestService: ServiceRequestService,
    private engSchedulerService: EngSchedulerService,
    private distributorService: DistributorService,
    private route: ActivatedRoute,
    private router: Router,
    private environment: EnvService,
    private datepipe: DatePipe = new DatePipe('en-US')
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isRemoteDesktop = this.route.snapshot.queryParams?.action === 'RMD';
    this.actionId = this.route.snapshot.queryParams?.aId;
    this.link = `/servicerequest/${this.id}`;

    this.user = this.accountService.userValue;
    this.profilePermission = this.profileService.userProfileValue;

    if (this.profilePermission != null) {
      const profilePermission = this.profilePermission.permissions.filter((x: any) => x.screenCode === 'SCDLE');
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

    this.initializeRole();
  }

  ngAfterViewInit(): void {
    // Calendar is ready after view init
  }

  initializeRole(): void {
    const segments = JSON.parse(sessionStorage.getItem('segments') || '[]');
    let role = segments?.[0]?.itemCode;

    if (this.user.isAdmin) {
      this.isAdmin = true;
    }

    if (role === this.environment.engRoleCode) {
      this.isEng = true;
      this.loadEngineerEvents();
    } else if (role === this.environment.distRoleCode) {
      this.isDistSupp = true;
      this.loadDistributorEvents();
    }
  }

  loadEngineerEvents(): void {
    this.loading = true;
    this.engSchedulerService.getByEngId(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (engData: any) => {
          console.log('Engineer events response:', engData);
          if (engData && engData.data && Array.isArray(engData.data) && engData.data.length > 0) {
            const filtered = engData.data.filter((x: any) => x.engId === this.user.contactId);
            console.log('Filtered engineer events:', filtered);
            if (filtered && filtered.length > 0) {
              this.srEngList = filtered;
              this.mapEventsFromSchedules();
            } else {
              console.log('No events after filtering');
              this.loading = false;
            }
          } else {
            console.log('No engineer data or empty array');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading engineer events:', error);
          this.loading = false;
        }
      });
  }

  loadDistributorEvents(): void {
    this.loading = true;
    // Display empty calendar immediately
    this.mapEventsFromSchedules();

    this.distributorService.getByConId(this.user.contactId)
      .pipe(first())
      .subscribe({
        next: (distData: any) => {
          console.log('Distributor data response:', distData);
          if (distData.data && distData.data.length > 0) {
            this.distributorService.getDistributorRegionContacts(distData.data[0].id, 'blank')
              .pipe(first())
              .subscribe({
                next: (contacts: any) => {
                  console.log('Distributor contacts response:', contacts);
                  console.log('isSuccessful:', contacts.isSuccessful);
                  console.log('data:', contacts.data);
                  console.log('data type:', typeof contacts.data);
                  console.log('data is array:', Array.isArray(contacts.data));
                  console.log('data length:', contacts.data ? contacts.data.length : 'null');

                  if (contacts.data != null && Array.isArray(contacts.data) && contacts.data.length > 0) {
                    console.log('Loading schedules for contacts');
                    this.loadSchedulesForDistributorContacts(contacts.data);
                  } else {
                    console.log('No contacts data or empty array');
                    this.loading = false;
                  }
                },
                error: (error) => {
                  console.error('Error loading distributor contacts:', error);
                  this.loading = false;
                }
              });
          } else {
            console.log('No distributor data found');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading distributor data:', error);
          this.loading = false;
        }
      });
  }

  loadSchedulesForDistributorContacts(contacts: any[]): void {
    console.log('Loading schedules for contacts:', contacts);
    this.distData = [];
    let completedRequests = 0;

    if (!contacts || contacts.length === 0) {
      console.log('No contacts to load');
      this.loading = false;
      return;
    }

    contacts.forEach((contact: any): void => {
      console.log('Fetching schedules for contact:', contact.id);
      this.engSchedulerService.getByEngId(contact.id)
        .pipe(first())
        .subscribe({
          next: (data: any) => {
            console.log('Schedule data for contact ' + contact.id + ':', data);
            if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
              data.data.forEach((schedule: any) => {
                this.distData.push(schedule);
              });
              // Update calendar immediately with new data
              this.srEngList = this.distData;
              this.mapEventsFromSchedules();
            }
            completedRequests++;
            console.log('Completed requests: ' + completedRequests + ' / ' + contacts.length);
            if (completedRequests === contacts.length) {
              console.log('All contacts loaded. Total schedules:', this.distData.length);
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Error loading schedule for contact ' + contact.id + ':', error);
            completedRequests++;
            if (completedRequests === contacts.length) {
              console.log('All contacts processed (with errors). Total schedules:', this.distData.length);
              this.loading = false;
            }
          }
        });
    });
  }

  mapEventsFromSchedules(): void {
    this.dataSrc = this.srEngList.map((schedule: any) => ({
      id: schedule.id,
      title: schedule.displayName || schedule.subject || 'Untitled',
      start: new Date(schedule.startTime),
      end: new Date(schedule.endTime),
      backgroundColor: '#5ba146',
      borderColor: '#5ba146',
      textColor: '#ffffff',
      extendedProps: {
        description: schedule.description,
        location: schedule.location,
        serReqId: schedule.serReqId,
        status: schedule.status,
        roomId: schedule.roomId,
        resourceId: schedule.resourceId,
        isAllDay: schedule.isAllDay,
        actionId: schedule.actionId
      }
    }));

    if (this.calendarComponent) {
      const api = this.calendarComponent.getApi();
      api.removeAllEvents();
      api.addEventSource(this.dataSrc);
    }

    this.loading = false;
  }

  handleEventClick(arg: EventClickArg): void {
    this.selectedEvent = arg.event;
    this.eventTitle = arg.event.title || '';
    this.eventDescription = arg.event.extendedProps['description'] || '';
    this.eventLocation = arg.event.extendedProps['location'] || '';
    if (this.datepipe) {
      this.eventStartDate = this.datepipe.transform(arg.event.start, 'yyyy-MM-dd HH:mm') || '';
      this.eventEndDate = this.datepipe.transform(arg.event.end, 'yyyy-MM-dd HH:mm') || '';
    } else {
      this.eventStartDate = arg.event.start ? new Date(arg.event.start).toLocaleString() : '';
      this.eventEndDate = arg.event.end ? new Date(arg.event.end).toLocaleString() : '';
    }
    this.showEventModal = true;
  }

  handleDateSelect(selectInfo: any): void {
    console.log('Date selected:', selectInfo);
    this.isCreatingEvent = true;
    this.showCreateEventModal = true;
    this.newEventErrors = {};
    this.eventTitle = '';
    this.eventDescription = '';
    this.eventLocation = '';

    if (selectInfo.start && selectInfo.end) {
      if (this.datepipe) {
        this.eventStartDate = this.datepipe.transform(selectInfo.start, 'yyyy-MM-dd\'T\'HH:mm') || '';
        this.eventEndDate = this.datepipe.transform(selectInfo.end, 'yyyy-MM-dd\'T\'HH:mm') || '';
      } else {
        this.eventStartDate = this.formatDateTime(selectInfo.start);
        this.eventEndDate = this.formatDateTime(selectInfo.end);
      }
    }

    // Deselect the calendar selection
    if (this.calendarComponent) {
      this.calendarComponent.getApi().unselect();
    }
  }

  private formatDateTime(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}T${hours}:${minutes}`;
  }

  saveNewEvent(): void {
    this.newEventErrors = {};

    if (!this.eventTitle || this.eventTitle.trim() === '') {
      this.newEventErrors['title'] = 'Event title is required';
    }

    if (!this.eventStartDate) {
      this.newEventErrors['startDate'] = 'Start date is required';
    }

    if (!this.eventEndDate) {
      this.newEventErrors['endDate'] = 'End date is required';
    }

    if (this.eventStartDate && this.eventEndDate) {
      const start = new Date(this.eventStartDate);
      const end = new Date(this.eventEndDate);
      if (end <= start) {
        this.newEventErrors['endDate'] = 'End date must be after start date';
      }
    }

    if (Object.keys(this.newEventErrors).length > 0) {
      return;
    }

    this.loading = true;

    const eventData = {
      Id: Math.random().toString(36).substring(2, 11),
      Subject: this.eventTitle,
      Description: this.eventDescription,
      Location: this.eventLocation,
      StartTime: new Date(this.eventStartDate).toISOString(),
      EndTime: new Date(this.eventEndDate).toISOString(),
      IsAllDay: false,
      IsBlock: false,
      IsReadonly: false,
      RoomId: this.user.contactId,
      ResourceId: this.user.contactId,
      EngId: this.user.contactId,
      SerReqId: this.id,
      ActionId: this.actionId,
      isActive: true,
      isDeleted: false
    };

    console.log('Saving event:', eventData);

    this.engSchedulerService.save(eventData)
      .pipe(first())
      .subscribe({
        next: (response: any) => {
          console.log('Event save response:', response);
          if (response.isSuccessful) {
            // Add event to local calendar
            const calendarEvent = {
              id: eventData.Id,
              title: eventData.Subject,
              start: new Date(eventData.StartTime),
              end: new Date(eventData.EndTime),
              backgroundColor: '#5ba146',
              borderColor: '#5ba146',
              textColor: '#ffffff',
              extendedProps: {
                description: eventData.Description,
                location: eventData.Location,
                serReqId: eventData.SerReqId,
                status: 'Active'
              }
            };

            this.dataSrc.push(calendarEvent);
            if (this.calendarComponent) {
              this.calendarComponent.getApi().addEvent(calendarEvent);
            }

            this.notificationService.showSuccess('Meeting scheduled successfully', 'Success');
            this.closeCreateEventModal();
          } else {
            this.notificationService.showError(response.message || 'Failed to schedule meeting', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error saving event:', error);
          this.notificationService.showError('Error scheduling meeting', 'Error');
          this.loading = false;
        }
      });
  }

  closeCreateEventModal(): void {
    this.showCreateEventModal = false;
    this.isCreatingEvent = false;
    this.eventTitle = '';
    this.eventDescription = '';
    this.eventLocation = '';
    this.eventStartDate = '';
    this.eventEndDate = '';
    this.newEventErrors = {};
  }

  refreshEvents(): void {
    this.loading = true;
    this.distData = [];
    this.dataSrc = [];
    if (this.isEng) {
      this.loadEngineerEvents();
    } else if (this.isDistSupp) {
      this.loadDistributorEvents();
    }
  }

  changeView(view: string): void {
    this.setView = view;
    if (this.calendarComponent) {
      const fcApi = this.calendarComponent.getApi();
      if (view === 'Week') {
        fcApi.changeView('timeGridWeek');
      } else if (view === 'Month') {
        fcApi.changeView('dayGridMonth');
      }
    }
  }

  onBackClick(): void {
    this.notificationService.filter('itemadded');
    this.router.navigate([this.link], {
      queryParams: { isNSNav: true }
    });
  }
}

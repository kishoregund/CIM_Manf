import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UsernotificationService } from '../_services/usernotification.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-notification-icon',
  templateUrl: './notification-icon.component.html',
  styleUrls: ['./notification-icon.component.css'],
  standalone: false
})
export class NotificationIconComponent implements OnInit {
  @ViewChild('notificationPanel') notificationPanel?: ElementRef<any>;
  @ViewChild('notificationBadge') notificationBadge?: ElementRef<any>;

  notificationCount: number = 0;
  notifications: any[] = [];
  isPanelOpen: boolean = false;
  isLoading: boolean = false;

  constructor(private notificationService: UsernotificationService) { }

  ngOnInit(): void {
    this.initializeNotifications();
    // Refresh notification count every 30 seconds
    interval(30000).subscribe(() => {
      this.updateNotificationCount();
    });
  }

  initializeNotifications(): void {
    this.updateNotificationCount();
  }

  updateNotificationCount(): void {
    this.notificationService.getUnreadCount()
      .subscribe({
        next: (response: any) => {
          console.log('Notification count response:', response);
          this.notificationCount = response?.data || response || 0;
          console.log('Notification count:', this.notificationCount);
          this.updateBadgeVisibility();
        },
        error: (error) => {
          console.error('Error fetching notification count:', error);
        }
      });
  }

  toggleNotificationPanel(): void {
    this.isPanelOpen = !this.isPanelOpen;
    if (this.isPanelOpen) {
      this.loadNotifications();
    }
  }

  closeNotificationPanel(): void {
    this.isPanelOpen = false;
  }

  loadNotifications(): void {
    this.isLoading = true;
    console.log('Loading notifications...');
    this.notificationService.getAll()
      .subscribe({
        next: (response: any) => {
          console.log('Notifications response:', response);
          this.notifications = response?.data || response || [];
          console.log('Notifications loaded:', this.notifications);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          console.error('Error details:', error.message, error.status);
          this.isLoading = false;
        }
      });
  }

  deleteNotification(notificationId: string): void {
    this.notificationService.delete(notificationId)
      .subscribe({
        next: () => {
          this.loadNotifications();
          this.updateNotificationCount();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      });
  }

  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAll()
        .subscribe({
          next: () => {
            this.notifications = [];
            this.notificationCount = 0;
            this.updateBadgeVisibility();
          },
          error: (error) => {
            console.error('Error clearing notifications:', error);
          }
        });
    }
  }

  private updateBadgeVisibility(): void {
    if (this.notificationBadge && this.notificationBadge.nativeElement) {
      if (this.notificationCount > 0) {
        this.notificationBadge.nativeElement.classList.add('show');
        this.notificationBadge.nativeElement.textContent = this.notificationCount;
      } else {
        this.notificationBadge.nativeElement.classList.remove('show');
      }
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString();
  }

  // Close panel when clicking outside
  onBackdropClick(): void {
    this.closeNotificationPanel();
  }
}

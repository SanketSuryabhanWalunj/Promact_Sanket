import { Component } from '@angular/core';
import { AlertToasterService, NotificationType, Notification } from './alert-toaster.service';

@Component({
  selector: 'app-alert-toaster',
  templateUrl: './alert-toaster.component.html',
  styleUrls: ['./alert-toaster.component.css']
})
export class AlertToasterComponent {

  notifications: Notification[] = [];

  constructor(public alertToasterService: AlertToasterService) { }

  ngOnInit() {
    this.alertToasterService.getAlert().subscribe((alert: Notification) => {
      this.notifications = [];
      if (!alert) {
        this.notifications = [];
        return;
      }
      this.notifications.push(alert);
      setTimeout(() => {
        this.notifications = this.notifications.filter(x => x !== alert);
      }, 3000);
    });
  }

  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter(x => x !== notification);
  }

  /**Set css class for Alert -- Called from alert component**/
  cssClass(notification: Notification) {
    if (!notification) {
      return;
    }
    switch (notification.type) {
      case NotificationType.Success:
        return 'toast-success';
      case NotificationType.Error:
        return 'toast-error';
      case NotificationType.Info:
        return 'toast-info';
      case NotificationType.Warning:
        return 'toast-warning';
    }
  }
}




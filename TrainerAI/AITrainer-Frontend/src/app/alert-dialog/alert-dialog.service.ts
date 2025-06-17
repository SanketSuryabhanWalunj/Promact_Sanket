import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from './alert-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AlertDialogService {

  constructor(private dialog: MatDialog) { }

  /**
   * Method is to show the custom message alert dialog.
   * @param message Alert dialog message.
   */
  openAlertDialog(message: string) {
    this.dialog.open(AlertDialogComponent, {
      data: { message },
      width: '300px',
      disableClose: true
    });
  }
}

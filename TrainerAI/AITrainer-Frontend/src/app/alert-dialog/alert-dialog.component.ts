import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StringConstant } from '../model/string-constants';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent {
  message: string;

  readonly ok = StringConstant.ok;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {
    this.message = data.message;
  }
}

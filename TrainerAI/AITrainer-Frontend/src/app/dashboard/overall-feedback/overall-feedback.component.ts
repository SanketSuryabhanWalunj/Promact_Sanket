import { Component } from '@angular/core';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { DatePipe } from '@angular/common';
import { overallFeedback } from 'src/app/model/feedback';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-overall-feedback',
  templateUrl: './overall-feedback.component.html',
  styleUrls: ['./overall-feedback.component.css']
})
export class OverallFeedbackComponent {

  role!: string | null;
  userId!: string | null;
  userName!: string | null;
  overallFeedback!: overallFeedback[];
  internshipId: string;

  constructor(
    private userService: UserService,
    private loader: LoaderTableService,
    private alert: AlertToasterService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.internshipId = "";
  }

  ngOnInit(): void {
    var token = localStorage.getItem("accessToken");
    if (!token) {
      console.error('JWT Token not found in local storage');
      return;
    }

    this.role = localStorage.getItem("role");
    this.userId = localStorage.getItem("userId");
    this.userName = localStorage.getItem("userName");
    this.activatedRoute.fragment.subscribe((type) => {
      this.activatedRoute.queryParams.subscribe((type) => {
        this.internshipId = type['internshipId'] as string;
      })
    })
    this.getFeedback();
  }

  /**
   * Get overall feedback of an intern by id.
   */
  getFeedback() {
    this.loader.showLoader();
    this.userService.getData(`Feedback/GetOverAllFeedbackbyInternId?userId=${this.userId}`).subscribe((res) => {
      this.overallFeedback = res
      this.loader.hideLoader();
    }, (error) => {
      if (error) {
        this.loader.hideLoader();
        this.alert.error("Intern not found");
      }
    });
  }

  /**
  * Method to change date format.
  * @param dateString Date in string format.
  * @returns Date in required format.
  */
  formatDate(dateString: Date): string | null | undefined {
    const messageDate = new Date(dateString);
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(messageDate, 'h:mm a d MMM yyyy');

  }
}



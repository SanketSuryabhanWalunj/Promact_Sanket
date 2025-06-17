import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AdminInternApprovalRequestDto, AdminInternPunchRecordRequestDetailsDto } from 'src/app/model/punch-records';
import { StringConstant } from 'src/app/model/string-constants';
import { UserService } from 'src/Services/user.service';

@Component({
  selector: 'app-admin-intern-attendance-details',
  templateUrl: './admin-intern-attendance-details.component.html',
  styleUrls: ['./admin-intern-attendance-details.component.css']
})
export class AdminInternAttendanceDetailsComponent {
  getAllInternRequestHistory!: AdminInternPunchRecordRequestDetailsDto[];
  approveRequestForm!: FormGroup;
  rejectRequestForm!: FormGroup;
  RequestedApprovedOrNot!: AdminInternApprovalRequestDto;
  punchId!: string;
  approved: string;
  rejected: string;
  filterWord!: string;
  // This will not change it is undefined
  filterDuration!: any;
  filterStatus!: string;
  // This will not change it is undefined
  allRequestRecords: any;
  // This will not change it is undefined
  allDates: any;
  // This will not change it is undefined
  internNames: any;
  readonly InternName = StringConstant.internName;
  readonly Pending = StringConstant.pending;
  readonly Approved = StringConstant.approved;
  readonly Rejected = StringConstant.rejected;
  readonly None = StringConstant.none;
  readonly AppliedDate = StringConstant.appliedDate;
  readonly ReasonForLeave = StringConstant.reasonForLeave;
  readonly UpdatedBy = StringConstant.updatedBy;
  readonly Action = StringConstant.action;
  readonly Approve = StringConstant.approve;
  readonly Reject = StringConstant.reject;
  readonly YouAreAboutTo = StringConstant.youAreAboutTo;
  readonly LeaveDoYouWantToProceed = StringConstant.leaveDoYouWantToProceed;
  readonly Reasons = StringConstant.reason;
  readonly RequestAttendance = StringConstant.requestAttendance;
  readonly Date = StringConstant.date;
  readonly Punches = StringConstant.punches;
  readonly RequestedDate = StringConstant.requestedDate;
  readonly RequestReason = StringConstant.requestReason;
  readonly Status = StringConstant.status;
  readonly Name = StringConstant.name;
  readonly ApproveRequest = StringConstant.approveRequest;
  readonly RejectRequest = StringConstant.rejectRequest;
  readonly Reason = StringConstant.reason;
  readonly EnterValidReason = StringConstant.enterValidReason;
  readonly RequestDoYouwantToProceed = StringConstant.requestDoYouwantToProceed
  readonly NoRequestedRecords = StringConstant.noRequestedRecords;
  readonly SaveChanges = StringConstant.saveChanges;
  readonly Close = StringConstant.close;
  readonly All = StringConstant.all;
  constructor(private userService: UserService, private loader: LoaderTableService, private alert: AlertToasterService, private formBuilder: FormBuilder) {
    this.getAllInternRequestHistory = []
    this.approved = 'Approved';
    this.rejected = 'Rejected';
  }
  ngOnInit(): void {
    this.getPunchRequestDetailsForAdmin()
    this.initApprovalForm();
    this.getAllInternsRequestDeatails();
  }
  /**
  * Method to initialize approveRequest form.
  */
  initApprovalForm(): void {
    this.approveRequestForm = this.formBuilder.group({
      leaveStatus: [true],
      Comments: ['', Validators.required],
    });
    this.rejectRequestForm = this.formBuilder.group({
      leaveStatus: [false],
      Comments: ['', Validators.required],
    });
  }
  /**
     * Gets all intern punch requests for admin
     */
  getPunchRequestDetailsForAdmin() {
    this.loader.showLoader();
    this.userService.getData(`PunchRecords/requestPunchdetailsForAdmin`).subscribe((res) => {
      this.loader.hideLoader();
      this.getAllInternRequestHistory = res;
    }, (error) => {
      if (error) {
        this.loader.hideLoader();
        this.alert.error("Punch request not done");
      }
    });
  }
  /**
   * closes the modal popup
   */
  closeModal() {
    this.approveRequestForm.reset({
      leaveStatus: true,
      Comments: ''
    });
  }
  /**
   * Opens the punch model for request
   * @param id will pass to the modal
   */
  openPunchModel(id: string) {
    this.punchId = id;
  }
  /**
   * Admin can approve or reject the request
   * @param data filters the intern name
   */
  approveRequest(data: any, status: string) {
    this.loader.showLoader();
    const internId:string =
    this.getAllInternRequestHistory
      .find(f => f.id === this.punchId)?.internId?? '';
    this.RequestedApprovedOrNot = {
      punchId: this.punchId,
      status: status,
      comments: data.Comments,
      internId: internId
    };
    this.userService.postData(`PunchRecords/punchRequestApprovedOrRejected`, this.RequestedApprovedOrNot).subscribe((res) => {
      this.loader.hideLoader();
      this.alert.success("Request Punch  Approval Send Succesfully");
      this.getPunchRequestDetailsForAdmin();
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error("Some error occured.Please try again later!")
      });
  }
  /**
 * gets the date format in AM and PM
 * @param Datevalue 
 */
  getDate(Datevalue: any) {
    if (Datevalue != null) {
      const now = new Date(Datevalue);
      let hour = now.getHours();
      const minute = now.getMinutes();
      const second = now.getSeconds();
      const ampm = hour >= 12 ? ' PM' : ' AM';
      hour = hour % 12;
      hour = hour ? hour : 12;
      const formattedMinutes = minute < 10 ? '0' + minute : minute;
      const timeString = hour + ':' + formattedMinutes + ' ' + ampm;
      return `${timeString}`;
    }
    return null
  }
  /**
* Gets all intern request for admin based on filter
*/
  getInternsRequestDeatails() {
    this.loader.showLoader();
    const params: any = {
      filterword: this.filterWord,
      filterduration: this.filterDuration || '',
      filterstatus: this.filterStatus || '',
    };
    const queryParams = Object.keys(params)
      .filter(key => params[key])
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    this.userService.getData(`PunchRecords/viewInternRequest-admin?${queryParams}`).subscribe((res) => {
      this.loader.hideLoader();
      this.getAllInternRequestHistory = res.requestApplication;
    });
  }
  /**
* Gets all intern details for filter dropdown
*/
  getAllInternsRequestDeatails() {
    this.loader.showLoader();
    this.userService.getData(`PunchRecords/viewAllInternRequest-admin`).subscribe((res) => {
      this.loader.hideLoader();
      this.allRequestRecords = res;
      this.internNames = [...new Set(this.allRequestRecords.flatMap((a: { internName: any; }) => a.internName))];
      this.allDates = [...new Set(this.allRequestRecords.flatMap((b: { date: any; }) => b.date))];
    });
  }
  /**
* To filter  leaves based on intern name
* @param name filters the intern name
*/
  filterByInternName(name: string) {
    this.filterWord = name;
    this.getInternsRequestDeatails();
  }
  /**
  * To filter  leaves based on leave duration
  * @param duration filters the leave duration
  */
  filterByRequestDuration(duration: Date) {
    this.filterDuration = duration;
    this.getInternsRequestDeatails();
  }
  /**
 * To filter  leaves based on leave status
 * @param filter filters the leave status
 */
  filterByStatus(filter: string) {
    this.filterStatus = filter;
    this.getInternsRequestDeatails();
  }
  /**
* To reset the form.
*/
  reset() {
    this.filterWord = '';
    this.filterStatus = '';
    this.filterDuration = '';
    this.getInternsRequestDeatails();
  }
}

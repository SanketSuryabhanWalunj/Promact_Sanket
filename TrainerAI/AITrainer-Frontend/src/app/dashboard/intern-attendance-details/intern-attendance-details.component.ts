import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { InternRequestDetailsDto, DeleteRequestDto, RequestPunchDto, PunchRecordRequestsDto } from 'src/app/model/punch-records';
import { StringConstant } from 'src/app/model/string-constants';
import { UserService } from 'src/Services/user.service';

@Component({
  selector: 'app-intern-attendance-details',
  templateUrl: './intern-attendance-details.component.html',
  styleUrls: ['./intern-attendance-details.component.css']
})
export class InternAttendanceDetailsComponent {
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  punchRequestForm!: FormGroup;
  today: Date;
  isValidPattern: boolean;
  punchesArray: string[];
  tags: string[];
  inputValue: string = '';
  requestPunchDto!: RequestPunchDto;
  allRequestsForPunchInAndOut!: InternRequestDetailsDto[];
  punchRecordRequestsDto!: PunchRecordRequestsDto[];
  DeleteRequest!: DeleteRequestDto;
  selectedRequest!: any;
  maxdate: string;
  minDate: string;
  setAlreadyApplied: boolean;
  formattedDate!: string;
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
  readonly AttendanceDate = StringConstant.attendanceDate;
  readonly Comment = StringConstant.comment;
  readonly Reset = StringConstant.reset;
  readonly Request = StringConstant.request;
  readonly DeleteRequestRecord = StringConstant.deleteRequestRecord;
  readonly AreYouSureYouWantToDelete = StringConstant.areYouSureYouWantToDelete;
  readonly Delete = StringConstant.delete;
  readonly InvalidTimeFormatPleaseEnterTimeInHHmmFormat = StringConstant.invalidTimeFormatPleaseEnterTimeInHHmmFormat;
  readonly InvalidFormatUseHHmmOrHHmmHHmme091830 = StringConstant.invalidFormatUseHHmmOrHHmmHHmme091830;
  readonly PunchTimesAreRequired = StringConstant.punchTimesAreRequired;
  readonly PleaseEnterPunchesIn24HoursFormateg9001830PressEnterAfterPuttingEachPunch = StringConstant.pleaseEnterPunchesIn24HoursFormateg9001830PressEnterAfterPuttingEachPunch;
  readonly PunchesShouldBeInChronologicalSequenceDoNotUseAnyStringsLikeAMPMEtc = StringConstant.punchesShouldBeInChronologicalSequenceDoNotUseAnyStringsLikeAMPMEtc;
  readonly Intern = StringConstant.intern;
  readonly YouHaveAlreadyRequestOnThisDate = StringConstant.youHaveAlreadyRequestOnThisDate;

  constructor(private fb: FormBuilder, private userService: UserService, private loader: LoaderService, private alert: AlertToasterService, private route: ActivatedRoute) {
    this.today = new Date();
    this.isValidPattern = false;
    this.allRequestsForPunchInAndOut = [];
    this.punchesArray = this.userService.getPunchData();
    this.tags = [];
    this.maxdate = this.today.toISOString().split('T')[0];
    let dateString: string | null = localStorage.getItem("internStartDate");
    this.minDate = new Date(dateString ? dateString : '').toISOString().split('T')[0];
    this.setAlreadyApplied = false;
  }

  ngOnInit(): void {
    this.initSubmitForm();
    this.requestPunchDetails();

    this.route.queryParams.subscribe(params => {
      const paramdate = params['date'];
      if (paramdate) {
        const date = new Date(paramdate);
        this.formattedDate = date.toISOString().split('T')[0];
        this.punchRequestForm.patchValue({
          attendanceDate: this.formattedDate
        });

      }
    });
    // To clar the punch details from service
    this.userService.clearPunchData();

  }
  ngAfterViewInit(): void {
    // Call onDateChange after the view is initialized
    const attendanceDate = this.punchRequestForm.get('attendanceDate')?.value;
    this.onDateChange(attendanceDate);
  }
  /**
    * Method to initialize Punch Request form.
    */
  initSubmitForm(): void {
    this.punchRequestForm = this.fb.group({
      attendanceDate: [this.getTodayDate(), Validators.required],
      requestType: [{ value: 'Requested', disabled: true }, Validators.required],
      punches: ['', [Validators.required, this.multipleTimeFormatValidator]],
      comment: [''],
    });
  }

  get getpunches() {
    return this.punchRequestForm.get('punches');
  }

  isRequiredError() {
    return this.getpunches?.errors?.['required'];
  }

  isInvalidTimeFormatError() {
    return this.getpunches?.errors?.['invalidTimeFormat'];
  }

  /**
      * Gets the date in 'YY-MM-DD'
      */
  getTodayDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  }
  /**
     * when enter punches it will take hours and minutes format 
     */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',' || event.key === ';') {
      event.preventDefault(); // Prevent default comma input
      this.addTag(this.inputValue.trim());
    } else if (event.key === 'Backspace' && this.inputValue === '') {
      this.removeTag(this.tags[this.tags.length - 1]);
    }
  }
  /**
     * when enter punches it will take one punch.
     */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  }
  /**
     * when enter punches it will add one punch to input tag.
     */
  addTag(tagText: string): void {
    if (tagText && !this.tags.includes(tagText)) {
      this.tags.push(tagText);
      this.inputValue = '';
    }
  }
  /**
     * when enter punches it will remove one punch to input tag.
     */
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }
  /**
     * It will submits the request form
     */
  onSubmit() {
    this.loader.showLoader();
    if (this.punchRequestForm.valid) {
      const formValue = this.punchRequestForm.getRawValue();
      this.requestPunchDto = {
        requestedPunchOutTime: new Date(formValue.attendanceDate),
        PunchInandOut: this.tags,
        Comments: formValue.comment,
      };
      this.userService.postData(`PunchRecords/requestPunch`, this.requestPunchDto).subscribe((res) => {
        this.loader.hideLoader();
        this.alert.success("Request Punch Applied Successfully");
        this.punchRequestForm.reset();
        this.reset();
        this.requestPunchDetails();
      }, (error) => {
        if (error) {
          this.loader.hideLoader();
          this.alert.error(error.error.split(":")[1]);
        }
      });
    }
  }
  /**
     * It will get all request punch details for admin
     */
  requestPunchDetails() {
    this.loader.showLoader();
    this.userService.getData(`PunchRecords/requestPunchdetails`).subscribe((res) => {
      this.punchRecordRequestsDto = res;
      this.loader.hideLoader();
    }, (error) => {
      if (error) {
        this.loader.hideLoader();
        this.alert.error("Punch request details not found");
      }
    });

  }
  /**
     * It will resets the request form
     */
  reset() {
    this.punchRequestForm.reset();
    this.punchRequestForm.get('attendanceDate')?.reset();
    this.punchRequestForm.get('punches')?.reset();
    this.punchRequestForm.get('comment')?.reset();
    this.tags = [];
  }
  /**
     * Gets the date based on hours and minutes format
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
     * Deletes the punch request based on Id.
     */
  deletePunchRequest(id: string): void {
    this.loader.showLoader();
    this.DeleteRequest = {
      punchRecordRequestId: id,
    };

    this.userService.postData(`PunchRecords/deleteRequest`, this.DeleteRequest).subscribe((res) => {
      this.loader.hideLoader();
      this.alert.success("Attendance punch request has been deleted successfully.");
      this.requestPunchDetails();
    }, (error) => {
      if (error) {
        this.loader.hideLoader();
        this.alert.error("Request punch delete failed");
      }
    });

  }
  /**
     * subtracts the time for UTC time.
     */
  subtractTimeFromDate(date: Date, hours: number, minutes: number): Date {
    const updatedDate = new Date(date);
    updatedDate.setHours(updatedDate.getHours() - hours);
    updatedDate.setMinutes(updatedDate.getMinutes() - minutes);
    return updatedDate;
  }
  /**
 * Sets the selected request ID to be deleted based on the provided index.
 * @param index The index of the request item to be deleted in the allRequestsForPunchInAndOut array.
 */
  selectToDelete(index: number) {
    this.selectedRequest = this.punchRecordRequestsDto[index].id;
  }
  /**
 * Validates time format in (9:00) or (21:00) should be there.
 * @param control takes the value of that input element.
 * 
 */
  multipleTimeFormatValidator(control: AbstractControl): ValidationErrors | null {
    const timePattern = /^(?:0?[0-9]|1\d|2[0-3]):([0-5]\d)$/;
    const value = control.value?.trim();
    if (!value) {
      return null;
    }
    const times = value.split(',').map((time: string) => time.trim());
    const allValid = times.every((time: string) => timePattern.test(time));
    return allValid ? null : { invalidTimeFormat: true };
  }
  onDateChange(event: string) {
    //const selectedDate = event.target.value;
    const isAlreadyApplied = this.punchRecordRequestsDto.some((recordrequest: { requestDate: Date; status: string; }) => {
      const requestedDate = new Date(recordrequest.requestDate).toISOString().split('T')[0];
      return event === requestedDate && recordrequest.status != "Rejected";
    });
    this.setAlreadyApplied = isAlreadyApplied;
  }
}

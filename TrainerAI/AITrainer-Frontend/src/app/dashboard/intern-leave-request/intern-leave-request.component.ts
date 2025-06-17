import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { imagedetails } from 'src/app/model/feedback';
import { LeaveCategory, LeaveType } from 'src/app/model/LeaveApplication';
import { StringConstant } from 'src/app/model/string-constants';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { holidayList } from 'src/app/model/holiday';


@Component({
  selector: 'app-intern-leave-request',
  templateUrl: './intern-leave-request.component.html',
  styleUrls: ['./intern-leave-request.component.css']
})
export class InternLeaveRequestComponent implements OnInit {
  requestLeaveForm!: FormGroup;
  leaveTypes = LeaveType;
  attachments: File[];
  isCheckHalfDay: boolean;
  today = new Date().toISOString().split('T')[0];
  invalidStartDate: boolean = false;
  invalidEndDate: boolean = false;
  leaves: any;
  setAlreadyApplied: boolean;
  minDate: string;
  leaveCategories = LeaveCategory;
  invalidDate: boolean = false;
  showWarn: boolean = true;
  length: any;
  currentPage: number = 1;
  defualtList: number = 10;
  filterWord: string;
  isLeaveOnHoliday: boolean;
  holidayList: holidayList[];

  readonly Attachment = StringConstant.attachment;
  readonly HalfDayLeave = StringConstant.halfDayLeave;
  readonly LeavePeriod = StringConstant.leavePeriod;
  readonly EndDateShouldBeGreaterThanStartDate = StringConstant.endDateShouldBeGreaterThanStartDate;
  readonly LeaveHasAlreadyBeenAppliedForSimilarPeriod = StringConstant.leaveHasAlreadyBeenAppliedForSimilarPeriod;
  readonly Reason = StringConstant.reason;
  readonly EnterValidReason = StringConstant.enterValidReason;
  readonly SaveChanges = StringConstant.saveChanges;
  readonly LeaveRequest = StringConstant.leaveRequest;
  readonly LeaveType = StringConstant.leaveType;
  readonly SelectLeaveType = StringConstant.selectLeaveType;
  readonly LeaveTypeIsRequired = StringConstant.leaveTypeIsRequired;
  readonly AddAttachment = StringConstant.addAttachment;
  readonly Cancel = StringConstant.cancel;
  readonly FirstHalf = StringConstant.firstHalf;
  readonly SecondHalf = StringConstant.secondHalf;
  readonly Rejected = StringConstant.rejected
  readonly leaveCanNotAppliedOnHoliday = StringConstant.leaveCanNotAppliedOnHoliday;

  constructor(private userService: UserService, private formBuilder: FormBuilder, private loader: LoaderTableService, private alert: AlertToasterService, protected router: Router, private route: ActivatedRoute) {
    this.attachments = [];
    this.isCheckHalfDay = false;
    this.setAlreadyApplied = false;
    this.isLeaveOnHoliday = false;
    let dateString: string | null = localStorage.getItem("internStartDate");
    this.minDate = new Date(dateString ? dateString : '').toISOString().split('T')[0];
    this.filterWord = '';
    this.holidayList = [];
  }

  @ViewChildren('textareaRef') textareaRefs!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.getLeaveRecords();
    this.getHolidayList();
    this.initSubmitForm();
    this.route.queryParams.subscribe(params => {
      const paramdate = params['date'];
      if (paramdate) {
        const date = new Date(paramdate);
        const formattedDate = date.toISOString().split('T')[0];
        this.requestLeaveForm.patchValue({
          startdate: formattedDate,
          enddate: formattedDate
        });
      }
    });
  }

  /**
   * Initializes the submit form with default values and validators.
   */
  initSubmitForm() {
    this.requestLeaveForm = this.formBuilder.group({
      leaveType: [null, Validators.required],
      leaveCategory: [null],
      isHalfDay: [false],
      startdate: [this.today, Validators.required],
      enddate: [this.today, Validators.required],
      reason: ['', Validators.required],

    });
    this.handleHalfDayValidation();
  }

  /**
    * Get the national holiday list to check the leave on holiday or not.
    */
  getHolidayList(): void {
    this.userService.getData(`Holidays/getholidays`).subscribe((res) => {
      this.holidayList = res;
    }
    );
  }

  /**
  * Retrieves the values of the LeaveType enum.
  * @returns An array of string values representing the enum options.
  */
  getLeaveTypeValues(): string[] {
    return Object.values(this.leaveTypes);
  }

  /**
  * Method to check sickLeave is selected or not
  */
  isSickLeaveSelected(): boolean {
    return this.requestLeaveForm.get('leaveType')?.value === 'Sick Leave';
  }

  /**
  * Method to get image details
  */
  openFileInput(): void {
    const fileInput = document.createElement(imagedetails.input);
    fileInput.type = imagedetails.file;
    fileInput.accept = imagedetails.image;
    fileInput.multiple = true;
    fileInput.style.display = imagedetails.none;

    fileInput.addEventListener(imagedetails.change, (event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach((file: File) => {
          this.attachments.push(file);
        });
      }

    });

    fileInput.click();
    document.body.removeChild(fileInput);
  }

  /**
  * Method to remove images from selected list
  */
  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  /**
   * Checks any leave type is selected or not
   * @returns requestLeaveForm('LeaveType') value.
   */
  isCheckleaveSelected(): void {
    return this.requestLeaveForm.get('leaveType')?.value;
  }

  /**
      * checks the value if it is true make it false and vice versa
      * @returns the value of isCheckHalfDay value true or false
      */
  onCheckHalfDayChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.isCheckHalfDay = !this.isCheckHalfDay;
    } else {
      this.isCheckHalfDay = !this.isCheckHalfDay;
    }
  }

  /**
  * Checks the validity of the start date and updates the end date accordingly.
  * Also checks if the start date is valid and if there is already a leave applied on the same date.
  */
  checkToday() {
    const startDate = this.requestLeaveForm.get('startdate')?.value;
    const endDate = this.requestLeaveForm.get('enddate')?.value;
    if (startDate && startDate < this.today) {
      this.invalidStartDate = true;
    } else {
      this.invalidStartDate = false;
    }
    if (endDate && startDate && endDate < startDate) {
      this.invalidEndDate = true;
    } else {
      this.invalidEndDate = false;
    }
    const isAlreadyApplied = this.leaves.some((leave: { leaveStartDate: string; leaveEndDate: string; leaveCategory: string; leaveStatus: string; }) => {
      const leaveStartDate = new Date(leave.leaveStartDate).toISOString().split('T')[0];
      const leaveEndDate = new Date(leave.leaveEndDate).toISOString().split('T')[0];
      if (((leaveStartDate >= startDate && leaveStartDate <= endDate) || (leaveEndDate >= startDate && leaveEndDate <= endDate)) && leave.leaveStatus != this.Rejected) {
        if (this.isCheckHalfDay) {
          if ((leave.leaveCategory === this.FirstHalf && leave.leaveCategory !== this.SecondHalf) ||
            (leave.leaveCategory === this.SecondHalf && leave.leaveCategory !== this.FirstHalf)) {
            if (leave.leaveCategory === this.requestLeaveForm.get('leaveCategory')?.value) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return true;
        }

      }
      return false;

    });

    this.setAlreadyApplied = isAlreadyApplied;

    if (isAlreadyApplied) {
      this.setAlreadyApplied = true;
    }
    else {
      this.setAlreadyApplied = false;
    }

    this.isLeaveOnHoliday = this.holidayList.some((holiday: { date: string }) => {
      const holidayDate = new Date(holiday.date).toISOString().split('T')[0];

      if ((startDate <= holidayDate && endDate >= holidayDate)) {
        return true;
      } else if (startDate == holidayDate) {
        return true;
      }
      else {
        return false;
      }
    });
  }

  /**
 * Fetches the leave records of the intern
 */
  getLeaveRecords(): void {

    this.userService.getData(`LeaveApplication/viewLeave-intern?currentPage=${this.currentPage}&defualtList=${this.defualtList}&filter=${this.filterWord}`).subscribe((res) => {

      this.leaves = res.leaveApplication;
      this.length = this.leaves.length;
    });
  }

  /**
    * Retrieves the values of the LeaveCategory enum.
    * @returns An array of string values representing the enum options.
    */
  getLeaveCategoryValues(): string[] {
    return Object.values(this.leaveCategories);
  }


  /**
    * Checks whether the dats are valid
    */
  checkEnddate() {
    const startDate = this.requestLeaveForm.get('startdate')?.value;

    const endDate = this.requestLeaveForm.get('enddate')?.value;
    if (this.isCheckHalfDay) {
      this.invalidDate = false;
    } else {
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        this.invalidDate = true;
      } else {
        this.invalidDate = false;
      }
    }
  }

  /**
   * Method to adjust height of text area
   */
  adjustTextareaHeight(): void {
    this.textareaRefs.forEach(textareaRef => {
      const textarea = textareaRef.nativeElement as HTMLTextAreaElement;
      textarea.style.overflow = 'hidden';
      textarea.style.height = 'auto';
      const desiredHeight = Math.min(textarea.scrollHeight, 350);

      textarea.style.height = `${desiredHeight}px`;

      if (desiredHeight >= 300) {
        textarea.style.overflowY = 'scroll';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    });
  }


  /**
  * Submits a leave application if the form is valid, otherwise displays a warning.
  * Upon successful submission, retrieves leave records, closes the request form,
  * and shows a success alert. If submission fails, displays an error alert.
  */
  applyLeave(): void {
    if (this.requestLeaveForm.valid) {
      this.loader.showLoader();

      const startdate = new Date(this.requestLeaveForm.get('startdate')?.value);
      startdate.setUTCHours(0, 0, 0, 0);
      const enddate = this.requestLeaveForm.get('enddate')?.value ? new Date(this.requestLeaveForm.get('enddate')?.value) : new Date(this.requestLeaveForm.get('startdate')?.value);
      if (enddate) {
        enddate.setUTCHours(0, 0, 0, 0);
      }
      const formData = this.requestLeaveForm.value;
      const body = new FormData();
      {
        body.append('leaveStartDate', startdate.toUTCString());
        if (this.isCheckHalfDay) {
          body.append('leaveEndDate', startdate.toUTCString());
        } else {
          body.append('leaveEndDate', enddate.toUTCString());
        }
        body.append('leaveType', formData.leaveType);
        body.append('leaveReason', formData.reason);
        body.append('leaveCategory', formData.leaveCategory);
        if (formData.leaveType == 'Sick Leave') {
          this.attachments.forEach(file => {
            body.append('Files', file, file.name);
          })
        };
      };
      this.userService.postData(`LeaveApplication/applyLeave`, body).subscribe(
        (res) => {
          this.alert.success("Your request has been submitted successfully");
          this.router.navigate(['/dashboard/intern-leave-application']);
          this.loader.hideLoader();
        },
        (error) => {
          this.loader.hideLoader();
          this.alert.error("Something went wrong please try again later");
        }
      );

    } else {
      this.loader.hideLoader();
      this.showWarn = true;
    }
  }


  /**
   * checks the half day is checked or not and sets validation.
   */
  handleHalfDayValidation(): void {
    const isHalfDayControl = this.requestLeaveForm.get('isHalfDay');
    const leaveCategoryControl = this.requestLeaveForm.get('leaveCategory');
    const endDateControl = this.requestLeaveForm.get('enddate');

    if (isHalfDayControl && leaveCategoryControl && endDateControl) {
      isHalfDayControl.valueChanges.subscribe((isHalfDay: boolean) => {
        if (isHalfDay) {
          leaveCategoryControl.setValidators(Validators.required);
          endDateControl.clearValidators();
        } else {
          endDateControl.setValidators(Validators.required);
          leaveCategoryControl.clearValidators();
        }
        leaveCategoryControl.updateValueAndValidity();
        endDateControl.updateValueAndValidity();
      });
    }
  }

}

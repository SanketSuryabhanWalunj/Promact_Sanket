import { Component } from '@angular/core';
import { InternBatchDto, LeavePunchDto, PunchLogTime, PunchRecordRequestsDto, PunchRecordsDto, punchRequestAttendanceDto } from 'src/app/model/punch-records';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import * as moment from 'moment';
import { StringConstant } from 'src/app/model/string-constants';
import { holidayList } from 'src/app/model/holiday';
import { LeaveType } from 'src/app/model/LeaveApplication';
import { Router } from '@angular/router';

@Component({
  selector: 'app-punch-records-details',
  templateUrl: './punch-records-details.component.html',
  styleUrls: ['./punch-records-details.component.css']
})
export class PunchRecordsDetailsComponent {
  currentWeekStart: moment.Moment;
  currentWeekEnd: moment.Moment;
  punchRecord: PunchRecordsDto[];
  startDate!: Date;
  endDate!: Date;
  // This is to get all dates in that week and it is undefined
  weekDates: any[];
  today: Date;
  punchRecordId: string;
  internStartDate: Date;
  leavepunchDto: LeavePunchDto[];
  internBatchDto!: InternBatchDto;
  holidayList: holidayList[] = [];
  punchRequestAttendanceDto: punchRequestAttendanceDto[];

  // String constant
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
  readonly AttendanceDetails = StringConstant.attendanceDetails;
  readonly TotalHours = StringConstant.totalHours;
  readonly RequestPunch = StringConstant.requestPunch;
  readonly ApplyLeave = StringConstant.applyLeave;
  readonly Requested = StringConstant.requested;
  readonly Applied = StringConstant.applied;
  readonly Sunday = StringConstant.sunday;
  readonly Monday = StringConstant.monday;
  readonly Tuesday = StringConstant.tuesday;
  readonly Wednesday = StringConstant.wednesday;
  readonly Thursday = StringConstant.thursday;
  readonly Friday = StringConstant.friday;
  readonly Saturday = StringConstant.saturday;
  readonly SickLeave = StringConstant.sickLeave;
  readonly CasualLeave = StringConstant.casualLeave;
  readonly WorkFromHome = StringConstant.workFromHome;
  readonly Wfh = StringConstant.wfh;

  constructor(private userService: UserService,
    private loader: LoaderTableService,
    private alert: AlertToasterService, protected router: Router,) {
    this.punchRecord = [];
    this.weekDates = [];
    this.leavepunchDto = [];
    this.currentWeekStart = moment().startOf('isoWeek');
    this.currentWeekEnd = moment().endOf('isoWeek');
    this.today = new Date();
    this.punchRecordId = '';
    let dateString: string | null = localStorage.getItem("internStartDate");
    this.internStartDate = dateString ? new Date(dateString) : new Date();
    this.punchRequestAttendanceDto = [];
  }

  ngOnInit(): void {
    this.getPunchDetails();
    this.setCurrentWeek(moment());
    this.getHolidayList(); // Get the holiday to reflect on attendance page.

  }
  /**
     * Get overall feedback of an intern by id.
     */
  getPunchDetails() {
    this.loader.showLoader();
    const body = {
      startDate: this.currentWeekStart.format('YYYY-MM-DD'),
      endDate: this.currentWeekEnd.format('YYYY-MM-DD'),
      month: 0,
      year: 0
    };
    this.userService.postData(`PunchRecords/getAllPunchDetails`, body).subscribe((res) => {
      this.punchRecord = res.punchRecords;
      this.leavepunchDto = res.leavePunchRecords;
      this.internBatchDto = res.isBatch;
      this.punchRequestAttendanceDto = res.punchRequestStartEndDateDtos
      this.generateWeekLogDates();
      this.loader.hideLoader();
    }, (error) => {
      if (error) {
        this.loader.hideLoader();
        this.alert.error("Details not found");
      }
    });
  }

  /**
     * Get the national holiday list
     */
  getHolidayList(): void {
    this.userService.getData(`Holidays/getholidays`).subscribe((res) => {
      this.holidayList = res;
    }
    );
  }

  /**
     * Calculates over all timespan and returns in hours and minutes.
     */
  calculateTotalTimeSpan(logs: PunchLogTime[] = []): string {
    let totalMinutes = 0;

    logs.forEach(log => {
      const [hours, minutes] = log.totalTimeSpan.split(':').map(Number);
      totalMinutes += hours * 60 + minutes;
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return `${this.pad(totalHours.toString())}h ${this.pad(remainingMinutes.toString())}m`;
  }
  /**
   * seperates hours and minutes
   */
  pad(hours: string): number {
    if (hours.includes('.')) {
      return parseInt(hours.split('.')[0])
    }
    return parseInt(hours)
  }
  /**
     * calculates overall timespan 
     */
  parseTimeSpanToMinutes(timeSpan: string): string {
    const [hours, minutes] = timeSpan.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes
    const hourss = Math.floor(totalMinutes / 60);
    const minutess = this.pad((totalMinutes % 60).toString());
    return `${hourss}:${minutess < 10 ? '0' : ''}${minutess}`;
  }
  /**
   * Formats the date into week, year, month and day
   */
  formatDate(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  }
  /**
      * Calculates the date value and returns in timestring in hours and minutes format
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
   * Method is to navigate the intern-attendance-details page and store the log times in user services.
   * @param punchRecord  getting the user punch details for perticular date.
   */
  punchRequest(punchRecord: PunchRecordsDto): void {
    const punchRecordArray: string[] = [];
    for (let item of punchRecord.punchLogTime ?? []) {
      const punchInTime = this.getDate(item.punchIn);
      if (punchInTime !== null) {
        punchRecordArray.push(punchInTime);
      }

      const punchOutTime = this.getDate(item.punchOut);
      if (punchOutTime !== null) {
        punchRecordArray.push(punchOutTime);
      }

    }

    this.userService.setPunchData(punchRecordArray);
    this.router.navigate(['/dashboard/punch-records-details/intern-attendance-details'], { queryParams: { date: punchRecord.punchDate } });
  }
  /**
    * Sets the currentweekstartday and currentweekendday
    */
  setCurrentWeek(startDate: moment.Moment) {
    this.currentWeekStart = startDate.clone().utc().startOf('isoWeek');
    this.currentWeekEnd = startDate.clone().utc().endOf('isoWeek');
  }
  /**
     * Calls the previous week filter
     */
  previousWeek() {
    this.setCurrentWeek(this.currentWeekStart.clone().subtract(1, 'weeks'));
    this.getPunchDetails();
  }
  /**
     * Calls the next week filter
     */
  nextWeek() {
    this.setCurrentWeek(this.currentWeekStart.clone().add(1, 'weeks'));
    this.getPunchDetails();
  }
  /**
     * Calculates the bar percentage
     */
  isProcess(logs: PunchLogTime[] = []): string {
    let totalMinutes = 0;

    logs.forEach(log => {
      const [hours, minutes] = log.totalTimeSpan.split(':').map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    const totalHours = totalMinutes / 60;
    const percentage = (totalHours / 8) * 100;
    const clampedPercentage = Math.min(percentage, 100);
    return `${clampedPercentage}%`;
  }
  /**
    * Gets the week log dates based on week
    */
  generateWeekLogDates() {
    this.weekDates = [];
    let currentDate = moment(this.currentWeekStart).utc().startOf('day');
    const weekEndDate = moment(this.currentWeekEnd).utc().endOf('day');
    while (currentDate.isSameOrBefore(weekEndDate, 'day')) {
      const recordForDate = this.punchRecord.find(record => moment(record.punchDate).utc().isSame(currentDate, 'day'));
      const leaveDto = this.getLeaveTypeAndStatus(new Date(currentDate.clone().toISOString()))
      const requestStatus = this.isPunchRequestStatus(new Date(currentDate.clone().toISOString()));
      const isApplyLeave = this.isleavePunch(new Date(currentDate.clone().toISOString()));
      const isStartDate = this.isInternStartDate(new Date(currentDate.clone().toISOString()));
      if (recordForDate) {
        recordForDate.leaveStatus = leaveDto.status;
        recordForDate.leaveType = leaveDto.leaveType;
        recordForDate.requestStatus = requestStatus;
        recordForDate.isApplyLeave = isApplyLeave;
        recordForDate.isStartDate = isStartDate;
      }
      this.weekDates.push(recordForDate || {
        punchDate: currentDate.clone().toISOString(),
        punchLogTime: [],
        requestStatus: requestStatus,
        isPunch: false,
        isApplyLeave: isApplyLeave,
        isStartDate: isStartDate,
        leaveStatus: leaveDto.status,
        leaveType: leaveDto.leaveType
      });
      currentDate.add(1, 'days');
    }
  }

  isPunchRequestStatus(date: Date): string | null {
    const punchRecordRequest: any = this.punchRequestAttendanceDto.filter(n => {
      const requestDate = new Date(n.requestDate);
      return requestDate.toDateString() === date.toDateString();
    });
    if (punchRecordRequest?.length > 0) {
      const approvedRequest = punchRecordRequest.find((p: { status: string; }) => p.status === 'Approved')
      if (approvedRequest) {
        return approvedRequest.status;
      } else {
        const pendingRequest = punchRecordRequest.find((p: { status: string; }) => p.status === 'Pending');
        if (pendingRequest) {
          return pendingRequest.status;
        } else {
          return null;
        }
      }
    }
    return null;
  }
  /**
     * Checks whether today is greater than yesterday
     */
  isTodayGreaterThan(date: Date): boolean {
    const today = new Date();
    const pastDate = new Date(date);
    return today > pastDate;
  }

  /**
    * Checks for request is pending or rejected.
    * @param logs is of type punchRecordsDto gets status.
    * @returns true or false
    */
  isStatusForRequest(logs: string): boolean {
    if (logs != null) {
      if (logs == this.Pending) {
        return true;
      }
      else {
        return false;
      }
    }
    return false;
  }
  /**
    * Checks for start date of intern.
    * @returns true or false
    */
  isInternStartDate(isstart: Date): boolean {
    if (isstart >= this.internStartDate) {
      return false;
    }
    else {
      return true;
    }
  }
  /**
    * Checks for todaydate is correct or not
    * @param today is type of date gets date value.
    * @returns true or false
    */
  isToday(today: Date): boolean {
    const todaydate = new Date();
    const gettoday = new Date(today);
    gettoday.setHours(0, 0, 0, 0);
    todaydate.setHours(0, 0, 0, 0);
    return gettoday.getTime() === todaydate.getTime();
  }
  /**
    * conditions based on punch requests to validate progress bars
    * @param record is list of punchRecordsDto.
    * @returns css class names
    */
  isProgressBar(record: PunchRecordsDto): string {
    if (this.isHoliday(record.punchDate)) {
      return 'att-opar';
    } else if (record.leaveStatus === this.Approved && this.isBatchleave(record.punchDate) && !this.isWorkFromCheck(record.punchDate)) {
      return 'att-bpar';
    }
    else
      if (!this.isBatchleave(record.punchDate)) {
        return 'att-ppar';
      }
      else if ((!this.isTodayGreaterThan(record.punchDate) || (record.punchLogTime && record.punchLogTime.length == 0 && this.isToday(record.punchDate)) || (record.isStartDate))) {
        return 'att-wpar';
      } else if (this.isBatchleave(record.punchDate)) {
        if ((this.isWorkFromCheck(record.punchDate) && record.leaveStatus === this.Approved) || (record.punchLogTime && record.punchLogTime.length > 0 && ((record.isRequest && record.requestStatus === this.Approved) || (!record.isRequest && record.requestStatus === null) || (!record.isRequest)))) {
          return 'att-gpar';
        } else {
          return 'att-rpar';
        }
      } else {
        return 'att-rpar';
      }
  }

  /**
   * Function to check the punch date is holiday or not.
   * @param punchDate date to check holiday or not.
   * @returns true if holiday otherwise false.
   */

  isHoliday(punchDate: Date): boolean {
    let isHoliday = false;
    this.holidayList.forEach(holiday => {
      if (this.isSameDate(holiday.date, punchDate)) {
        isHoliday = true; // Set isHoliday to true if a match is found
      }
    });
    return isHoliday;
  }

  /**
   * Method is to check if holiday then get the holiday name.
   * @param punchDate punch date to get the same date holiday name.
   * @returns String Holiday name.
   */
  getHolidayName(punchDate: Date): string {
    let holidayName = '';
    this.holidayList.forEach(holiday => {
      if (this.isSameDate(holiday.date, punchDate)) {
        holidayName = holiday.holidayName; // Set isHoliday to true if a match is found
      }
    });
    return holidayName;
  }

  // Helper function to check if two dates are the same (ignoring time)
  isSameDate(holidayDate: string, punchDate: Date): boolean {
    const date1 = new Date(holidayDate);
    const date2 = new Date(punchDate);
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  /**
 *To check the date leave applied or not
 * @param isstart is date.
 * @returns true or false
 */
  isleavePunch(isstart: Date): boolean {
    if (this.leavepunchDto?.length > 0) {
      if (this.leavepunchDto.some(n =>
        new Date(n.leaveStartDate) <= isstart &&
        new Date(n.leaveEndDate) >= isstart)) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
  /**
   *To check the batch has how many days
   * @param isBatchstart is date.
   * @returns true or false
   */
  isBatchleave(isBatchstart: Date): boolean {
    const dayIndex = new Date(isBatchstart).getDay();
    const weekdayNames = [this.Sunday, this.Monday, this.Tuesday, this.Wednesday, this.Thursday, this.Friday, this.Saturday];

    if (this.internBatchDto) {
      return this.internBatchDto.weekdaysNames.includes(weekdayNames[dayIndex])
    } else {
      return false;
    }
  }

  /**
    * Checks for intern work from home or not.
    * @returns true or false
    */
  isWorkFromCheck(punch: Date): boolean {
    const LeaveDTO = this.getLeaveTypeAndStatus(punch);
    if (LeaveDTO.leaveType == this.WorkFromHome && LeaveDTO.status == this.Approved) {
      return true;
    }
    return false;
  }

  /**
    * Checks for leave date of intern.
    * @returns true or false
    */
  isleaveCheck(punch: Date): boolean {
    const LeaveDTO = this.getLeaveTypeAndStatus(punch);
    if ((LeaveDTO.leaveType == this.CasualLeave || LeaveDTO.leaveType == this.SickLeave) && LeaveDTO.status == this.Approved) {
      return false;
    }
    return true;
  }
  getLeaveTypeAndStatus(punchDate: Date): { leaveType: string, status: string } {
    if (!this.leavepunchDto || this.leavepunchDto.length === 0) {
      return { leaveType: '', status: '' };
    }
    const punchDateValue = new Date(punchDate).setHours(0, 0, 0, 0);

    const leaveApplications = this.leavepunchDto.filter(p => {
      const leaveStartDate = new Date(p.leaveStartDate).setHours(0, 0, 0, 0);
      const leaveEndDate = p.leaveEndDate
        ? new Date(p.leaveEndDate).setHours(0, 0, 0, 0)
        : new Date(8640000000000000).getTime();

      return leaveStartDate <= punchDateValue && leaveEndDate >= punchDateValue;
    });

    //Add this condition to get "punchDate" letast leave record, if he applied for multiple times for same date and some leaves rejected.
    const leaveApplication = leaveApplications.reduce((latest, current) => {
      return new Date(latest.createdDate) > new Date(current.createdDate) ? latest : current;
    }, leaveApplications[0]);

    return leaveApplication
      ? { leaveType: leaveApplication.leaveType, status: leaveApplication.leaveStatus }
      : { leaveType: '', status: '' };
  }

}

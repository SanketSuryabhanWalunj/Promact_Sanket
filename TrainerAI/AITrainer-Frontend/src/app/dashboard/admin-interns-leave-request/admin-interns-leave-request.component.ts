import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { leaveApproval, LeaveDocumentAttachmentDto } from 'src/app/model/LeaveApplication';
import { StringConstants } from 'src/app/shared/string-constants';
import { PunchCommonMethods } from 'src/app/shared/punch-common-methods';
import { StringConstant } from 'src/app/model/string-constants';

@Component({
  selector: 'app-admin-interns-leave-request',
  templateUrl: './admin-interns-leave-request.component.html',
  styleUrls: ['./admin-interns-leave-request.component.css']
})
export class AdminInternsLeaveRequestComponent implements OnInit {
  currentPage: number = 1;
  pageNumbers: number[] = [];
  visiblePages: number = 3;
  totalPage: number = 0;
  defualtList: number = 10;
  leaveRecord: any;
  selectedListItem: any = [];
  show: boolean = false;
  approveLeaveForm!: FormGroup;
  startDate: any;
  name: any;
  totalDay: any;
  endDate: any;
  isAllDeleted: boolean = false;
  length: any;
  filterWord: string;
  reason: any;
  rejectLeaveForm!: FormGroup;
  filterName: string;
  filterDuration: string;
  allDays: any;
  internNames: any;
  allLeaveRecords: any;
  approveStatus: boolean;
  leaveAttachment!: LeaveDocumentAttachmentDto[];

  constructor(private userService: UserService, private formBuilder: FormBuilder, private loader: LoaderTableService, private alert: AlertToasterService, private punchCommonMethods: PunchCommonMethods) {
    this.filterName = '';
    this.filterDuration = '';
    this.filterWord = '';
    this.approveStatus = false;
  }
  ngOnInit(): void {
    this.getInternsLeaveDeatails();
    this.initApprovalForm();
    this.getAllInternsLeaveDeatails();
  }
  readonly InternName = StringConstants.internName;
  readonly StartedDate = StringConstants.startDate;
  readonly EndedDate = StringConstants.endDate;
  readonly Type = StringConstants.type;
  readonly TotalDays = StringConstants.totalDays;
  readonly ApprovalStatus = StringConstants.approvalStatus;
  readonly Pending = StringConstants.pending;
  readonly Approved = StringConstants.approved;
  readonly Rejected = StringConstants.rejected;
  readonly None = StringConstants.none;
  readonly AppliedDate = StringConstants.appliedDate;
  readonly ReasonForLeave = StringConstants.reasonForLeave;
  readonly UpdatedBy = StringConstants.updatedBy;
  readonly Action = StringConstants.action;
  readonly Approve = StringConstants.approve;
  readonly Reject = StringConstants.reject;
  readonly NoLeaveRecords = StringConstants.noLeaveRecords;
  readonly ApproveOfLeave = StringConstants.approveLeave;
  readonly YouAreAboutTo = StringConstants.youAreAboutTo;
  readonly LeaveDoYouWantToProceed = StringConstants.leaveDoYouWantToProceed;
  readonly Reasons = StringConstants.reason;
  readonly RejectLeave = StringConstants.rejectLeave;
  readonly EnterValidReason = StringConstants.enterValidReason;
  readonly SaveChanges = StringConstants.saveChanges;
  readonly FirstHalf = StringConstants.firstHalf;
  readonly SecondHalf = StringConstants.secondHalf;
  readonly LeaveAttachments = StringConstant.leaveAttachments;
  readonly SmallAttachment = StringConstant.smallAttachment;
  readonly SmallAttachments = StringConstant.smallAttachments;
  readonly PopupBlockedByTheBrowser = StringConstant.popupBlockedByTheBrowser;
  readonly AttachmentDetails = StringConstant.attachmentDetails;
  readonly All = StringConstant.all;
  /**
   * Intialize leave approval form
   */
  initApprovalForm() {
    this.approveLeaveForm = this.formBuilder.group({
      leaveStatus: [true],
      Comments: ['', Validators.required],
    });
    this.rejectLeaveForm = this.formBuilder.group({
      leaveStatus: [false],
      Comments: ['', Validators.required],
    });
  }

  /**
   * Fetches the  intern's leave details from API
   */
  getInternsLeaveDeatails() {
    this.loader.showLoader();
    this.userService.getData(`LeaveApplication/viewInternLeave-admin?currentPage=${this.currentPage}&defualtList=${this.defualtList}&filterword=${this.filterWord}&filtername=${this.filterName}&filterduration=${this.filterDuration}`).subscribe((res) => {
      this.loader.hideLoader();
      this.leaveRecord = res.leaveApplication;
      this.totalPage = res.totalPages;
      this.length = this.leaveRecord.length;
      this.generatePageNumbers();

    });
  }

  /**
   * To close the leave approval form
   */
  closeModal() {
    this.approveLeaveForm.reset({
      leaveStatus: true,
      Comments: ''

    });
  }

  /**
   *To open approval form 
   * @param list Leave details list
   */
  openApproveModal(list: leaveApproval, isApproved: boolean) {
    this.selectedListItem = list;
    this.approveStatus = isApproved;
    this.approveLeaveForm.reset({
      leaveStatus: true,
      Comments: ''

    });
  }
  /**
   * To approve the leave or reject the leave
   * @param data Leave data
   */
  approveLeave(data: any) {
    this.loader.showLoader();
    const body = {
      leaveId: this.selectedListItem.id,
      leaveStatus: this.approveStatus ? 'Approved' : 'Rejected',
      comments: data.Comments
    };

    this.userService.changeData(`LeaveApplication/approveLeave`, body).subscribe((res) => {
      this.loader.hideLoader();
      if (this.approveStatus) {
        this.alert.success("Leave Approval Send Succesfully");
      }
      else {
        this.alert.success("Leave Rejection Send Succesfully");
      }

      this.getInternsLeaveDeatails();
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error(StringConstants.someErrorOccuredPleaseTryAgainLater)
      });
  }

  /**
 * Updates the visible page numbers based on the current page and total number of pages.
 * Calculates the range of visible page numbers centered around the current page.
 */
  updateVisiblePages() {
    const halfVisible = Math.floor(this.visiblePages / 2);
    const startPage = Math.max(1, this.currentPage - halfVisible);
    const endPage = Math.min(this.totalPage, startPage + this.visiblePages - 1);
    this.pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }
  /**
* Navigates to the specified page number, retrieves leave data accordingly, and updates visible pages.
* @param pageNumber The page number to navigate to.
*/
  goToPage(pageNumber: number) {
    this.leaveRecord = [];
    this.currentPage = pageNumber;
    this.userService.getData(`LeaveApplication/viewInternLeave-admin?currentPage=${this.currentPage}&defualtList=${this.defualtList}&filter=${this.filterWord}&filtername=${this.filterName}&filterduration=${this.filterDuration}`).subscribe((res) => {
      this.leaveRecord = res.leaveApplication;
      this.totalPage = res.totalPages;
      this.updateVisiblePages();
    });
  }


  /**
 * Moves to the next page of leave data if available, and updates visible pages accordingly.
 * If the current page is already the last page, does nothing.
 */
  next() {

    if (this.currentPage + 1 < this.totalPage) {
      this.currentPage++;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    } else if (this.totalPage != this.currentPage) {
      this.currentPage++;
      this.goToPage(this.currentPage);
    }
  }


  /**
 * Moves to the previous page of leave data if available, and updates visible pages accordingly.
 * If the current page is the first page, does nothing.
 */
  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    }
  }

  /**
 * Generates an array of page numbers based on the total number of pages.
 * The generated page numbers range from 1 to the total number of pages.
 */
  generatePageNumbers() {
    this.pageNumbers = [];
    for (let i = 1; i <= this.totalPage; i++) {
      this.pageNumbers.push(i);
    }
  }


  /**
   * To delete a leave record
   * @param id The Id of the record to be deleted
   */
  deleteRecord(id: string) {
    this.loader.showLoader();
    this.userService
      .deleteData(`LeaveApplication/${id}`)
      .subscribe((res) => {
        if (res) {
          const indexToRemove = this.leaveRecord.findIndex((leave: { id: any; }) => leave.id === id);
          if (indexToRemove !== -1) {
            this.leaveRecord.splice(indexToRemove, 1);
          }
          if (this.leaveRecord.length === 0) {
            if (this.currentPage > 1) {
              this.currentPage--;
              this.goToPage(this.currentPage);
              this.updateVisiblePages();
            }
          } else {
            this.goToPage(this.currentPage);
          }
          if (this.currentPage == 1) {
            if (
              this.leaveRecord.length <= 0 &&
              this.leaveRecord.every((leave: { isDeleted: any; }) => leave.isDeleted)
            ) {
              this.isAllDeleted == true;
            }
          }
          this.loader.hideLoader();
          this.alert.success("Leave Record deleted successfully")
        }
      });
  }

  /**
   * To filter  leaves based on approval status
   * @param filter the filter status
   */
  filterByStatus(filter: string) {
    this.currentPage = 1;
    this.filterWord = filter;
    this.getInternsLeaveDeatails();
  }
  /**
* To filter  leaves based on intern name
* @param name filters the intern name
*/
  filterByInternName(name: string) {
    this.currentPage = 1;
    this.filterName = name;
    this.getInternsLeaveDeatails();
  }
  /**
 * To filter  leaves based on leave duration
 * @param duration filters the leave duration
 */
  filterByLeaveDuration(duration: string) {
    this.currentPage = 1;
    this.filterDuration = duration;
    this.getInternsLeaveDeatails();
  }
  /**
  * Fetches the all intern's leave details from API
  */
  getAllInternsLeaveDeatails(): void {
    this.loader.showLoader();
    this.userService.getData(`LeaveApplication/viewAllInternLeave-admin`).subscribe((res) => {
      this.loader.hideLoader();
      this.allLeaveRecords = res.leaveApplication;
      this.allDays = [...new Set(this.allLeaveRecords.flatMap((a: { totalDay: any; }) => a.totalDay))];
      this.internNames = [...new Set(this.allLeaveRecords.flatMap((b: { name: any; }) => b.name))];
    });
  }
  /**
   * Reset all intern's filter details from API
   */
  reset() {
    this.filterWord = '';
    this.filterName = '';
    this.filterDuration = '';
    this.getInternsLeaveDeatails();
  }

  /**
  *To open reject form 
  * @param list Leave details list
  */
  openRejectModal(list: leaveApproval, isApproved: boolean) {
    this.selectedListItem = list;
    this.approveStatus = isApproved;
    // this.startDate = list.leaveStartDate;
    // this.name = list.name;
    // this.reason = list.leaveReason;
    // this.totalDay = list.totalDay;
    // this.endDate = list.leaveEndDate;
    this.rejectLeaveForm.reset({
      leaveStatus: false,
      Comments: ''

    });
  }
  /**
  *To check the day is halfday or not
  * @param days is number
  * @param category is string
  * @returns count of days
  */
  adminDayCount(days: number, category: string) {
    const result = this.punchCommonMethods.dayCount(days, category);
    return result;
  }
  /**
  * Opens the modal and sets the selectedListItemReason.
  * @param reason The string value to set as selectedListItemReason.
  */
  openAttachmentModal(attachment: LeaveDocumentAttachmentDto[]) {
    this.leaveAttachment = attachment;
    if (this.leaveAttachment?.length > 0) {
      const modal = document.getElementById('show-Attachment');
      if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
      }
    }

  }
  /**
   * Closes the modal and clears any related data.
   */
  closeAttachmentModal() {
    this.leaveAttachment = [];
    const modal = document.getElementById('show-Attachment');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }
  getImage(leaveAttachement: LeaveDocumentAttachmentDto) {
    const imageUrl = this.convertBase64ToBlobAndCreateUrl(leaveAttachement.fileData);
    const popupWindow = window.open(imageUrl, '_blank', 'width=600,height=400');
    if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
      this.loader.hideLoader();
      this.alert.error(this.PopupBlockedByTheBrowser);
    }
  }
  base64ToBlob(base64Data: string, contentType: string): Blob {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
  convertBase64ToBlobAndCreateUrl(FileData: string): string {
    const base64String = `data:image/jpeg;base64,${FileData}`;
    const contentType = 'image/jpeg';
    const base64Data = base64String.split(',')[1];
    const blob = this.base64ToBlob(base64Data, contentType);
    return URL.createObjectURL(blob);
  }
}

import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { leaveApplication, LeaveDocumentAttachmentDto } from 'src/app/model/LeaveApplication';
import { StringConstant } from 'src/app/model/string-constants';
import { PunchCommonMethods } from 'src/app/shared/punch-common-methods';


@Component({
  selector: 'app-intern-leave-application',
  templateUrl: './intern-leave-application.component.html',
  styleUrls: ['./intern-leave-application.component.css']
})
export class InternLeaveApplicationComponent implements OnInit {
  leaves: any;
  currentPage: number = 1;
  pageNumbers: number[] = [];
  visiblePages: number = 3;
  totalPage: number = 0;
  defualtList: number = 10;
  length: any;
  selectedLeave: any;
  isAllDeleted: any;
  filterWord: string;
  selectedListItemReason: any = {};
  leaveAttachment!: LeaveDocumentAttachmentDto[];
  imagesFromAttachment: leaveApplication | null = null;


  readonly Pending = StringConstant.pending;
  readonly AreYouSureYouWantToDelete = StringConstant.areYouSureYouWantToDelete;
  readonly FirstHalf = StringConstant.firstHalf;
  readonly SecondHalf = StringConstant.secondHalf;
  readonly LeaveDetails = StringConstant.leaveDetails;
  readonly Rejected = StringConstant.rejected;
  readonly AttachmentDetails = StringConstant.attachmentDetails;
  readonly Undefined = StringConstant.undefined;
  readonly PopupBlockedByTheBrowser = StringConstant.popupBlockedByTheBrowser;
  readonly SmallAttachment = StringConstant.smallAttachment;
  readonly SmallAttachments = StringConstant.smallAttachments;
  readonly LeaveAttachments = StringConstant.leaveAttachments;
  /**
   *
   */
  constructor(private userService: UserService, private loader: LoaderTableService, private alert: AlertToasterService, private punchCommonMethods: PunchCommonMethods) {
    this.filterWord = '';
  }

  @ViewChildren('textareaRef') textareaRefs!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.getLeaveRecords();
    this.getLeaveDates();
    this.currentPage = 1;
    this.visiblePages = 3;
    this.totalPage = 0;
    this.defualtList = 10;
  }


  /**
   * Fetches the current leave dates of intern
   */
  getLeaveDates() {
    this.userService.getData(`LeaveApplication/LeaveDates`).subscribe((res) => {

    });
  }

  /**
   * Fetches the leave records of the intern
   */
  getLeaveRecords() {
     this.loader.showLoader();
    this.userService.getData(`LeaveApplication/viewLeave-intern?currentPage=${this.currentPage}&defualtList=${this.defualtList}&filter=${this.filterWord}`).subscribe((res) => {
      this.loader.hideLoader();
      this.leaves = res.leaveApplication;
      this.length = this.leaves.length;
      this.totalPage = res.totalPages;
      this.generatePageNumbers();
    });
  }

  /**
   * Sets the selected leave ID to be deleted based on the provided index.
   * @param index The index of the leave item to be deleted in the leaves array.
   */
  selectToDelete(index: number) {
    this.selectedLeave = this.leaves[index].id;

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
    this.loader.showLoader();
    this.leaves = [];
    this.currentPage = pageNumber;
    this.userService.getData(`LeaveApplication/viewLeave-intern?currentPage=${this.currentPage}&defualtList=${this.defualtList}&filter=${this.filterWord}`).subscribe((res) => {
      this.loader.hideLoader();
      this.leaves = res.leaveApplication;
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
   * Deletes a leave record by its ID.
   * @param id The ID of the leave record to be deleted
   */
  deleteRecord(id: string) {
    this.loader.showLoader();
    this.userService
      .deleteData(`LeaveApplication/${id}`)
      .subscribe((res) => {
        if (res) {
          const indexToRemove = this.leaves.findIndex((leave: { id: any; }) => leave.id === id);
          if (indexToRemove !== -1) {
            this.leaves.splice(indexToRemove, 1);
          }
          if (this.leaves.length === 0) {
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
              this.leaves.length <= 0 &&
              this.leaves.every((leave: { isDeleted: any; }) => leave.isDeleted)
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
   * Filters leave records by status and updates the current page to 1.
   * @param filter The status to filter leave records.
   */
  filterByStatus(filter: string) {
    this.currentPage = 1;
    this.filterWord = filter;
    this.getLeaveRecords();
  }

  /**
   * Opens the modal and sets the selectedListItemReason.
   * @param reason The string value to set as selectedListItemReason.
   */
  openModal(reason: string) {
    this.selectedListItemReason = reason;
    const modal = document.getElementById('show-Reasons');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }
  /**
   * Closes the modal and clears any related data.
   */
  closeModal() {
    this.selectedListItemReason = {};
    const modal = document.getElementById('show-Reasons');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  /**
  * Method to read the file
  */
  getArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = error => reject(error);
    });
  }

  /**
 *To check the day is halfday or not
 * @param days is number
 * @param category is string
 * @returns count of days
 */
  internDayCount(days: number, category: string) {
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

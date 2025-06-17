import { AfterViewChecked, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { FeedbackResponse, FeedbackType, MessageFormat } from 'src/app/model/internship';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-internship-feedback',
  templateUrl: './internship-feedback.component.html',
  styleUrls: ['./internship-feedback.component.css']
})
export class InternshipFeedbackComponent implements AfterViewChecked {
  role!: string | null;
  userId!: string | null;
  userName!: string | null;
  internshipId!: string;
  overallFeedback!: FeedbackResponse[];
  currentDateTime!: Date;
  sendMessage!: FormGroup;
  ngFeedbackMessage: MessageFormat[] = []
  isfeedbackEditing: boolean = false;
  selectedFeedback!: FeedbackResponse | null;
  backupFeedback: FeedbackResponse[] = [];

  @ViewChildren('textareaRef') textareaRefs!: QueryList<ElementRef>;
  @ViewChild('textareaRef2') textareaRef2!: ElementRef;


  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private loader: LoaderTableService,
    private alert: AlertToasterService,
  ) {
  }

  ngOnInit(): void {
    var token = localStorage.getItem("accessToken");
    if (!token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: any = jwt_decode(token);

    this.role = localStorage.getItem("role");
    this.userId = localStorage.getItem("userId");
    this.userName = localStorage.getItem("userName");
    this.activatedRoute.fragment.subscribe((type) => {
      this.activatedRoute.queryParams.subscribe((type) => {
        this.internshipId = type['internshipId'] as string;
      })
    })
    this.getFeedback();
    this.sendMessage = this.formBuilder.group({
      comment: ['', Validators.required],
    })
  }

  ngAfterViewChecked(): void {
    this.adjustTextareaHeight();
  }

  /**
   * Get overall feedback of an intern.
   */
  getFeedback() {
    this.currentDateTime = new Date();
    this.loader.showLoader();
    this.userService.getData(`Internship/GetOverAllFeedback?internshipId=${this.internshipId}`).subscribe((res) => {
      this.overallFeedback = res.map((fb: FeedbackResponse, i: number) => {
        this.ngFeedbackMessage[i] = { ...fb.message };
        return {
          ...fb,
          message: { ...fb.message },
          type: fb.type as FeedbackType,
          isEditing: false
        };
      });
      this.loader.hideLoader();
      this.backupFeedback = [...this.overallFeedback]
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
    return datePipe.transform(messageDate, 'h:mm a dd MMM yyyy');

  }

  /**
   * Method to send general feedback.
   * @param comment The message to be sent.
   */
  SendGeneralFeedback(comment: string) {
    if (this.sendMessage.valid) {
      const data = {
        InternshipId: this.internshipId,
        Comment: comment
      }
      this.loader.showLoader();
      this.userService.postData(`Internship/CreateGeneralFeedback`, data).subscribe(() => {
        this.getFeedback();
        this.loader.hideLoader();
      });
      this.loader.hideLoader();
      this.sendMessage.reset();
    }
    else {
      this.alert.error("Please enter message.");
    }
  }

  /**
   * Method to adjust height of text area
   */
  adjustTextareaHeight(): void {
    this.textareaRefs.forEach(textareaRef => {
      const textarea = textareaRef.nativeElement as HTMLTextAreaElement;
      textarea.style.overflow = 'hidden';
      textarea.style.height = `auto`;
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  /**
  * Method to adjust height of send message text area
  */
  adjustSendTextareaHeight(): void {
    const textarea = this.textareaRef2.nativeElement as HTMLTextAreaElement;
    textarea.style.overflow = 'hidden';
    textarea.style.height = `auto`;
    const desiredHeight = Math.min(textarea.scrollHeight, 350);

    textarea.style.height = `${desiredHeight}px`;

    if (desiredHeight >= 300) {
      textarea.style.overflowY = 'scroll';
    } else {
      textarea.style.overflowY = 'hidden';
    }

  }

  /**
   * Method to select the feedback to be edited.
   * @param feedback The feedback to be edited.
   */
  selectEditFeedback(feedback: FeedbackResponse) {
    const index = this.overallFeedback.findIndex(item => item.id === feedback.id);
    // this.backupFeedback[index].message = { ...this.ngFeedbackMessage[index] };
    this.isfeedbackEditing = true;
    this.backupFeedback[index].isEditing = true;
  }

  /**
   * Method to edit feedback.
   * @param feedbackMessage The feedback message to be edited.
   * @param index Index of feedback message in feedback array.
   */
  async saveEditFeedback(feedbackMessage: MessageFormat, index: number) {
    this.loader.showLoader();
    const trimmedFeedback = feedbackMessage.feedback && feedbackMessage.feedback.trim();
    const trimmedImprovementArea = feedbackMessage.improvementArea && feedbackMessage.improvementArea.trim();
    const trimmedComment = feedbackMessage.comment && feedbackMessage.comment.trim();

    // Update the ngFeedbackMessage with trimmed values
    feedbackMessage = {
      ...feedbackMessage,
      feedback: trimmedFeedback,
      improvementArea: trimmedImprovementArea,
      comment: trimmedComment
    };

    const updatedFeedback = {
      ...this.overallFeedback[index],
      message: feedbackMessage
    };
    await this.userService.changeData(`Internship/EditFeedback`, updatedFeedback).pipe(finalize(() => this.adjustTextareaHeight())).subscribe(
      {
        next: (res) => {
          this.loader.hideLoader();
          this.isfeedbackEditing = false
          this.backupFeedback[index].isEditing = false;
          this.overallFeedback[index] = res;
          this.backupFeedback[index] = { ...res };
        },
        error: (err) => {
          this.loader.hideLoader();
          this.alert.error("All fields are required");
          this.isfeedbackEditing = false
        }
      }
    )
    await this.adjustTextareaHeight()
  }

  /**
   * Method to cancel edit.
   * @param index Index of feedback message in feedback array.
   */
  async cancelEdit(index: number) {
    this.isfeedbackEditing = false;
    if (this.backupFeedback[index].message) {
      this.ngFeedbackMessage[index] = { ...this.backupFeedback[index].message };
    }
    this.backupFeedback[index].isEditing = false
    await this.adjustTextareaHeight();
  }

  /**
   * Method to select feedback to be deleted.
   * @param feedback The selected feedback to be deleted.
   */
  selectDeleteFeedback(feedback: FeedbackResponse) {
    this.selectedFeedback = feedback;
  }

  /**
   * Method to delete selected feedback.
   */
  deleteFeedback() {
    this.loader.showLoader();
    this.userService.deleteData(`Internship/DeleteFeedback?feedbackId=${this.selectedFeedback?.id}`).subscribe((res) => {
      this.getFeedback();
      this.loader.hideLoader();
      this.alert.success('Feedback deleted successfully');
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error("Feedback not found");
      }
    )
    this.selectedFeedback = null
  }

  /**
   * Method to deselect selected feedback.
   */
  closeModal() {
    this.selectedFeedback = null;
  }

}

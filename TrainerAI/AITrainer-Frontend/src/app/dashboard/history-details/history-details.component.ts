import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import jwt_decode from 'jwt-decode';
import { QuizQuestyResponseDto, answeredOptionACs } from 'src/app/model/quiz';
import { assignmentFeedback, journalFeedback } from 'src/app/model/feedback';
import { SubmissionDto, SubmitAssignmentDto } from 'src/app/model/history';
import { StringConstants } from 'src/app/shared/string-constants';
import { AssignmentDto, AssignmentFromDto } from 'src/app/shared/model';

@Component({
  selector: 'app-history-details',
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.css'],
})
export class HistoryDetailsComponent implements OnInit, AfterViewInit {
  pageType!: string;
  id!: string;
  topicId!: string;
  assignment!: SubmissionDto;
  submitAssignment!: FormGroup;
  journalFeedback!: FormGroup;
  journal: any;
  role!: string;
  token: any = '';
  feedback!: journalFeedback;
  assignmentFeedback!: FormGroup;
  submissionId!: string;
  feedbackAssignment!: assignmentFeedback;
  editEvaluate: boolean = false;
  assignmentFeedbackId!: string;
  content: any[] = [];
  submittedQuiz: boolean = false;
  SubmittedQuizDetails!: QuizQuestyResponseDto[];
  attendQuiz: boolean = false;
  linkForQuiz: any;
  answers: answeredOptionACs[] = [];
  hideQuizButtons: boolean = false;

  publishFeedback: boolean = false;
  editJournalFeedback!: FormGroup;
  journalFeedbackId!: string;
  AssignmentSubmissionId!: string;
  internshipId!: string;
  exceedsMaxValue: boolean = false;
  endDate!: string;
  today = new Date().toISOString().split('T')[0];
  isDropdownOpen = false;
  selectedText = 'Select an option';
  selectedId: string | null = null;
  constantString = StringConstants;
  assignmentOptionsList: AssignmentDto[]=[]; // for assignment options


  @ViewChildren('textareaRef') textareaRefs!: QueryList<ElementRef>;
  @ViewChildren('textareaRef2') textareaRefs2!: QueryList<ElementRef>;
  @ViewChildren('textareaRef3') textareaRefs3!: QueryList<ElementRef>;


  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private loader: LoaderTableService,
    private alert: AlertToasterService
  ) {
    this.assignmentFeedback = this.formBuilder.group({
      Feedback: ['', Validators.required],
      Score: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getRole();
    this.getfragment();
    this.initSubmitForm();

  }

  ngAfterViewInit(): void {
    this.textareaRefs.changes.subscribe(() => {
      this.adjustTextareaHeight();
    });
    this.adjustTextareaHeight();
  }

  getControl(controlName: string) {
    return this.assignmentFeedback.get(controlName);
  }

  initSubmitForm() {
    this.submitAssignment = this.formBuilder.group({
      assignmentId: ['', Validators.required],
      githubLink: ['', Validators.required],
    });

    this.journalFeedback = this.formBuilder.group({
      AdminReview: [''],
    });

    this.assignmentFeedback = this.formBuilder.group({
      Feedback: ['', Validators.required],
      Score: ['', Validators.required],
    });

    this.editJournalFeedback = this.formBuilder.group({
      FeedbackPoints: ['', Validators.required],
      Rating: ['', Validators.required],
      ImprovementArea: ['', Validators.required],
      AdminReview: ['', Validators.required],
    });
  }

  getRole() {
    this.token = localStorage.getItem('accessToken');
    if (!this.token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: any = jwt_decode(this.token);
    this.role =
      decodedToken[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];
  }

  getfragment() {
    this.activatedRoute.fragment.subscribe((type) => {
      this.pageType = type as string;
      this.activatedRoute.queryParams.subscribe((type) => {
        this.id = type['id'] as string;
        this.topicId = type['topicId'] as string;
        this.internshipId = type['internshipId'] as string;
        this.endDate = type['dt'] as string;
        if (this.pageType == 'assignment') {
          this.AssignmentSubmissionId = type['assignmentSubmisionId'];
        }
        this.getDetails(this.id, this.pageType);
      });
    });
  }

  getDetails(id: string, type: string) {
    if (type == 'quiz') {
      this.submittedQuiz = false;
      this.attendQuiz = false;
      this.userService
        .getData(`Interndashboard/GetQuiz?id=${id}`)
        .subscribe((res) => {
          this.submittedQuiz = true;
          this.SubmittedQuizDetails = res;

          if (res === null || res === undefined || id === undefined) {
            this.userService
              .getData(`Interndashboard/GetLink?TopicId=${this.topicId}`)
              .subscribe((res) => {
                this.linkForQuiz = res;
                this.submittedQuiz = false;
                this.attendQuiz = true;
              });
          }
        });
    }
    if (type == 'assignment') {
      this.loader.showLoader();
      this.userService
        .getData(
          `Interndashboard/GetAssignment?id=${id}&assignmentSubmisionId=${this.AssignmentSubmissionId}`
        )
        .subscribe((res) => {
          this.assignment = res;
          this.content = res.assignment;
          this.submissionId = res.submissionId;
          this.GetAssignmentFeedback();
          this.loader.hideLoader();
          //create an object holding assignment data
          const assignmentOption = {
            id: this.id,
            name: this.assignment.assignmentTitle
          };
          this.assignmentOptionsList.push(assignmentOption);
        });
    }
    if (type == 'journal') {
      this.loader.showLoader();
      if (id) {
        this.userService
          .getData(`Interndashboard/GetJournalDetails?id=${id}`)
          .subscribe((res) => {
            this.journal = res;
            this.getJournalFeedBack();
          });
      }
      this.loader.hideLoader();
    }
  }

 /**
 * Submits the assignment form data.
 * This method handles the submission of assignment data by first showing a loading indicator,
 * then assigning `topicId` and `internshipId` to the `data` object before making a POST request
 * to the `assignments/assignment-submission` endpoint. After receiving the response, the
 * assignment form is reset, the loader is hidden, and a success message is displayed.
 *
 * @param data - The data object of type `SubmitAssignmentDto` containing assignment details such as `assignmentId` and `githubLink`.
 *
 * @returns void
 */
 submitAssignmentForm(data: AssignmentFromDto):void {
    this.loader.showLoader();
    const updateData={
      assignmentId: data.assignmentId,
      githubLink: data.githubLink,
      topicId: this.topicId,
      internshipId: this.internshipId
    }
    this.userService
      .postData('assignments/assignment-submission', updateData)
      .subscribe((res) => {
        this.assignment = res;
        this.submitAssignment.reset();
        this.loader.hideLoader();
        this.alert.success('Assignment Successfully Saved');
      });
  }

  navigateJournals() {
    this.router.navigate([
      '/dashboard/view-journal',
      'history',
      this.topicId,
      this.internshipId,
    ]);
  }

  GenreteJournalfeedback(data: any) {
    this.loader.showLoader();
    data.JournalId = this.id;
    data.internshipId = this.internshipId;
    data.topicId = this.topicId;
    this.userService
      .postData('JournalFeedback/journal-feedback', data)
      .subscribe(
        (res) => {
          this.feedback = res;
          this.loader.hideLoader();
          this.alert.success('Journal Feedback Generated Successfully');
        },
        (error) => {
          this.loader.hideLoader();
          this.alert.error(
            'Error occured while generating feedback.Please try after sometime...'
          );
        }
      );
  }

  getJournalFeedBack() {
    this.userService
      .getData(`JournalFeedback/journal-feedback?journalId=${this.id}`)
      .subscribe((res) => {
        this.feedback = res;
      });
  }

  CreateAssignmentFeedback(data: any) {
    data.assignmentId = this.id;
    data.internshipId = this.internshipId;
    if (this.editEvaluate == false) {
      this.loader.showLoader();
      data.submitedAssgnimentId = this.submissionId;
      this.userService
        .postData('AssignmentFeedback/CreateAssignmentFeedback', data)
        .subscribe((res) => {
          this.submissionId = res.submitionId;
          this.feedbackAssignment = res;
          this.loader.hideLoader();
        });
    } else {
      this.loader.showLoader();
      data.id = this.assignmentFeedbackId;
      this.userService
        .changeData('AssignmentFeedback/UpdateAssignmentFeedback', data)
        .subscribe((res) => {
          this.feedbackAssignment = res;
          this.loader.hideLoader();
          this.alert.success('Assignment Feedback Update Successfully');
        });
    }
  }

  GetAssignmentFeedback() {
    this.userService
      .getData(
        `AssignmentFeedback/getAssignmentFeedback?Id=${this.submissionId}&assignmentId=${this.id}`
      )
      .subscribe((res) => {
        this.feedbackAssignment = res;
        //this.publishFeedback=true;
      });
  }

  editAssignmentEvaluate() {
    this.exceedsMaxValue = false;
    this.editEvaluate = true;
    this.userService
      .getData(
        `AssignmentFeedback/getAssignmentFeedback?Id=${this.submissionId}&assignmentId=${this.id}`
      )
      .subscribe((res) => {
        this.assignmentFeedbackId = res.id;
        this.feedbackAssignment = res;
        this.assignmentFeedback.patchValue({
          Feedback: res.feedback,
          Score: res.score,
        });
      });
  }
  goToQuiz() {
    window.open(this.linkForQuiz, '_blank');
  }
  getResult() {
    this.loader.showLoader();
    this.userService
      .getData(`Quiz/GetQuizResultInter?TopicId=${this.topicId}`)
      .subscribe(
        (res) => {
          this.loader.hideLoader();

          this.alert.success('Your quiz submition marked');
          this.hideQuizButtons = true;
        },
        (error) => {
          this.loader.hideLoader();
          this.hideQuizButtons = false;
          this.alert.error(
            'You have not yet submitted the quiz. Please submit your quiz first'
          );
        }
      );
  }
  checkAnswer(answeredOptions: any[], quizOption: any): boolean {
    if (answeredOptions) {
      return answeredOptions.some(
        (answer) =>
          answer.questionId === quizOption.singleMultipleAnswerQuestionID &&
          answer.answeredOption === quizOption.id
      );
    }
    return false;
  }

  PublishAssignmentEvaluation() {
    this.loader.showLoader();
    const flag = { IsPublish: true };
    this.userService
      .changeData(
        `AssignmentFeedback/PublishFeedback?feedbackId=${this.feedbackAssignment.id}`,
        flag
      )
      .subscribe((res) => {
        this.feedbackAssignment.isPublished = res;
        this.alert.success('Assignment Feedback Published Successfully');
      });
    this.loader.hideLoader();
  }

  PublishJournalFeedback() {
    const flag = { IsPublish: true };
    this.loader.showLoader();
    this.userService
      .changeData(
        `JournalFeedback/publish-journal-feedback?feedbackId=${this.feedback.id}`,
        flag
      )
      .subscribe((res) => {
        this.feedback.isPublished = res;
        this.alert.success('Journal Feedback Published Successfully');
      });
    this.loader.hideLoader();
  }

  PatchEditJournalFeedback() {
    this.userService
      .getData(`JournalFeedback/journal-feedback?journalId=${this.id}`)
      .subscribe((res) => {
        this.journalFeedbackId = res.id;
        this.editJournalFeedback.patchValue({
          FeedbackPoints: res.feedbackPoints,
          Rating: res.rating,
          ImprovementArea: res.improvementArea,
          AdminReview: res.adminReview,
        });
      });
  }
  EditJournalFeedback(data: any) {
    data.id = this.journalFeedbackId;
    data.journalId = this.id;
    this.userService
      .changeData(`JournalFeedback/edit-journal-feedback`, data)
      .subscribe((res) => {
        this.feedback = res;
      });
  }
  checkMaxValue(max: number, value: number) {
    if (value && value > max) {
      this.exceedsMaxValue = true;
    } else {
      this.exceedsMaxValue = false;
    }
  }
  setEvaluate() {
    this.exceedsMaxValue = false;
  }

  /**
   * Method to delete submitted assignments
   */
  deleteSubmission() {
    this.userService
      .deleteSubmittedAssignment(
        `assignments/DeleteSubmittedAssignment?InternshipId=${this.internshipId}&SubmissionId=${this.AssignmentSubmissionId}`
      )
      .subscribe((res) => {
        this.getfragment();
        this.router.navigateByUrl(
          `/dashboard/internships/${this.internshipId}`
        );
      });
  }

  /**
   * Method to adjust height of text area
   */
  adjustTextareaHeight(): void {
    this.textareaRefs2.forEach((textareaRef) => {
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

    this.textareaRefs.forEach((textareaRef) => {
      const textarea = textareaRef.nativeElement as HTMLTextAreaElement;
      textarea.style.overflow = 'hidden';
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });

    this.textareaRefs3.forEach((textareaRef) => {
      const textarea = textareaRef.nativeElement as HTMLTextAreaElement;
      textarea.style.overflow = 'hidden';
      textarea.style.height = 'auto';
      const desiredHeight = Math.min(textarea.scrollHeight, 60);

      textarea.style.height = `${desiredHeight}px`;

      if (desiredHeight >= 60) {
        textarea.style.overflowY = 'scroll';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    });
  }

  /**
   * Method to call adjust text area height function when modal opens.
   */
  modalShown(): void {
    this.adjustTextareaHeight();
  }

  /**
 * Toggles the dropdown menu visibility.
 * This method is responsible for toggling the state of the dropdown. When invoked,
 * it switches the `isDropdownOpen` property between true and false, which controls
 * whether the dropdown is shown or hidden.
 *
 * @returns void
 */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

/**
 * Selects an item from the dropdown.
 * This method is triggered when a user selects an item from the dropdown. It updates
 * the `selectedText` to display the selected item's title and sets the form control
 * value for `assignmentId` using the provided `id`. The dropdown is then closed.
 *
 * @param item - The selected assignment object.
 * @param id - The ID of the selected assignment.
 *
 * @returns void
 */  selectItem(item: any,id:string): void {
    this.selectedText = item.assignmentTitle;
    this.submitAssignment.get('assignmentId')?.setValue(id);
    this.isDropdownOpen = false;
  }


/**
 * Truncates text to a maximum length and appends ellipsis if necessary.
 *
 * This method checks the length of the input text and truncates it if it exceeds
 * a defined maximum length. If the text is truncated, '...' is appended to the result.
 *
 * @param text - The text to be truncated.
 *
 * @returns string - The truncated text or the original text if within the limit.
 */  truncatedText(text: string): string {
    const maxLength=60;
    if (text.length > maxLength) {
      return text.substring(0,maxLength) + '...';
    }
    return text;
  }

  /**
   * method to clear the selected tezt on model close
   * @returns void
   */
  closeModel():void{
    this.selectedText='';
  }

  /**
   *method to reset evaluate form on close
   @returns void
   */
  closeEvaluateModel():void{
    this.assignmentFeedback.reset();

  }

  /**
   * method to back to history page
   * Set all the parameters into route
   * @returns void
   */
  backToHistory():void{
    this.router.navigate(['/dashboard/history'], {
      queryParams: {
        id: this.id,
        topicId: this.topicId,
        internshipId: this.internshipId,
        dt: this.endDate,
        assignmentSubmisionId: this.AssignmentSubmissionId
      },
      fragment: 'quiz' // Set the fragment if needed
    });
  }
}

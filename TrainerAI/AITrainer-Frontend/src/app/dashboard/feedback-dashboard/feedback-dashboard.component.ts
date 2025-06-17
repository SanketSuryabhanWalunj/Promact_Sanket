import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/Services/user.service';
import { batch } from 'src/app/model/internship';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { feedbackDashboard, overallFeedback, overallFeedbackRequest } from 'src/app/model/feedback';
import { Router } from '@angular/router';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';

@Component({
  selector: 'app-feedback-dashboard',
  templateUrl: './feedback-dashboard.component.html',
  styleUrls: ['./feedback-dashboard.component.css'],
})
export class FeedbackDashboardComponent implements OnInit, AfterViewInit {
  batches: batch[] = [];
  selectbatchform!: FormGroup;
  internIdList!: string[];
  selectedBatchId!: string;
  feedbacks!: feedbackDashboard[];
  feedbackLength!: number;
  selectedBatchName!: string;
  editOverallFeedback!: FormGroup;
  patchInternId!: string;
  overallFeedbackId!: string;
  totalFeedbacks!: overallFeedback[];
  feedbackStatus: { [key: string]: boolean } = {};
  editMode!: boolean
  @ViewChildren('textareaRef') textareaRefs!: QueryList<ElementRef>;

  constructor(private alert: AlertToasterService, private readonly userService: UserService, private readonly formBuilder: FormBuilder, private loader: LoaderTableService, private router: Router) {
  }

  ngOnInit(): void {
    this.initSubmitForm();
    this.getBatch();
    this.initEditForm();
  }
  ngAfterViewInit(): void {
    this.loadFeedbackStatuses();
    this.textareaRefs.changes.subscribe(() => {
      this.adjustTextareaHeight();
    });
    this.adjustTextareaHeight();
  }
  /*
  Method to intialise  the form which will be submitted when user selects a particular Batch
  */
  initSubmitForm() {
    this.selectbatchform = this.formBuilder.group({
      batch: [null, Validators.required],
    });
  }
  /*
  Method to intialise  the form which will be edit overall feedback.
  */
  initEditForm() {
    this.editOverallFeedback = this.formBuilder.group({
      behaviourPerformance: ['', Validators.required],
      technicalPerformance: ['', Validators.required],
      rightFit: [
        '',
        Validators.required
      ],
      detailedFeedback: ['', Validators.required],
    });
  }
  /*
  API call to get all available Batches
  */
  getBatch() {
    this.loader.showLoader();
    this.userService.getData("Batch/ListBatch").subscribe((res: batch[]) => {
      this.batches = res;
      this.loader.hideLoader();
      if (this.batches && this.batches?.length > 0) {
        const storedBatch = localStorage.getItem('selectedBatch');

        if (storedBatch && this.batches.find(batch => batch.id === JSON.parse(storedBatch))) {
          this.selectbatchform.patchValue({
            batch: JSON.parse(storedBatch)
          });
          this.selectedBatchId = JSON.parse(storedBatch);
        } else {
          this.selectbatchform.patchValue({
            batch: this.batches[0].id
          });
          this.selectedBatchId = this.batches[0].id;
          this.selectedBatchName = this.batches[0].batchName;
        }
        this.Select(this.selectbatchform.value);
      }
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error("Some error occured, Please try again later.");
      });
  }
  /*
  Method that is called whenever there is any  change in value of Select 
  */
  Select(data: FormGroup) {
    const selectedBatch = this.selectbatchform.get('batch')?.value;
    if (selectedBatch) {
      this.selectedBatchId = selectedBatch.toString();
      localStorage.setItem('selectedBatch', JSON.stringify(selectedBatch));
      this.getFeedback();
    }

  }
  /*
  API Call to get feedbacks according to the selected Batch Id
  */
  getFeedback() {
    this.loader.showLoader();
    this.userService.getData(`Feedback/GetFeedback?batchId=${this.selectedBatchId}`).subscribe((res) => {
      this.feedbacks = res;
      this.feedbackLength = this.feedbacks.length;
      this.loader.hideLoader();
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error("An error occured while fetching feedback, Please try after some time.")
      });
  }
  /* Navigates  to  Feedback Details Page*/
  navigateToDetails() {
    this.router.navigate(['/dashboard/feedback-detail']);
  }
  /**
 * Generates overall feedback for a specific intern by sending a request to the server.
 * @param internId The unique identifier of the intern for whom to generate overall feedback.
 */
  GenerateOverallFeedback(internId: string) {
    this.loader.showLoader();
    this.userService.getData(`Feedback/OverallFeedbackByAI?internId=${internId}&batchName=${this.selectedBatchName}`).subscribe((res) => {
      const index = this.feedbacks.findIndex((intern) => intern.id === internId);
      if (index !== -1) {
        this.feedbacks[index].overallFeedback = res;
      }
      this.loader.hideLoader();
      this.alert.success("Feedback generated successfully.")
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error(error.message);
        if (!error.message) {
          this.alert.error("An error occured while creating feedback, Please try after some time.")
        }
      });
  }
  /**
   * Retrieves a specific form control from the editOverallFeedback form group based on the provided name.
   * @param name The name of the form control to retrieve.
   * @returns The AbstractControl instance corresponding to the provided name, or null if not found.
   */
  getControl(name: string): AbstractControl | null {
    return this.editOverallFeedback.get(name);
  }
  /**
 * Sets the edit mode and intern ID for editing overall feedback, and patches the feedback values into the form.
 * @param internId The unique identifier of the intern whose feedback is being edited.
 * @param edit A boolean value indicating whether the edit mode is enabled.
 */
  async patchFeeedback(internId: string, edit: boolean) {
    this.loader.showLoader();
    this.editMode = edit;
    this.patchInternId = internId;
    const index = this.feedbacks.findIndex((intern) => intern.id === internId);
    this.overallFeedbackId = this.feedbacks[index].overallFeedback.id;
    this.editOverallFeedback.patchValue({
      behaviourPerformance: this.feedbacks[index].overallFeedback.behaviourPerformance,
      technicalPerformance: this.feedbacks[index].overallFeedback.technicalPerformance,
      rightFit: this.feedbacks[index].overallFeedback.rightFit,
      detailedFeedback: this.feedbacks[index].overallFeedback.detailedFeedback,
    });
    if (!this.editMode) {
      this.editOverallFeedback.get('behaviourPerformance')?.disable();
      this.editOverallFeedback.get('technicalPerformance')?.disable();
      this.editOverallFeedback.get('rightFit')?.disable();
      this.editOverallFeedback.get('detailedFeedback')?.disable();
    }
    else {
      this.editOverallFeedback.get('behaviourPerformance')?.enable();
      this.editOverallFeedback.get('technicalPerformance')?.enable();
      this.editOverallFeedback.get('rightFit')?.enable();
      this.editOverallFeedback.get('detailedFeedback')?.enable();

    }
    await this.adjustTextareaHeight();
    this.loader.hideLoader();
  }
  /**
   * Adjusts the height of textarea elements to fit their content.
   */
  adjustTextareaHeight(): void {
    this.textareaRefs.forEach(textareaRef => {
      const textarea = textareaRef.nativeElement as HTMLTextAreaElement;
      textarea.style.overflow = 'hidden';
      textarea.style.height = 'auto';
      const desiredHeight = Math.min(textarea.scrollHeight, 160);

      textarea.style.height = `${desiredHeight}px`;
      if (desiredHeight >= 160) {
        textarea.style.overflowY = 'scroll';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    })
  }

  /**
 * Updates the feedback for a specific intern.
 * @param feedback The updated feedback data.
 */
  editFeedback(feedback: overallFeedbackRequest) {
    this.loader.showLoader();
    feedback.internId = this.patchInternId;
    feedback.id = this.overallFeedbackId;
    this.userService.changeData('Feedback/UpdateOverallFeedback', feedback).subscribe(res => {
      const index = this.feedbacks.findIndex((intern) => intern.id === this.patchInternId);
      if (index !== -1) {
        this.feedbacks[index].overallFeedback = res;
      }
      this.loader.hideLoader();
      this.alert.success("Feedback edited successfully.")
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error(error.message);
        if (!error.message) {
          this.alert.error("An error occured while editing feedback.")
        }
      });
  }
  /**
 * Retrieves the total feedback for a specific intern.
 * @param id The unique identifier of the intern.
 */
  GetTotalFeedback(id: string) {
    this.loader.showLoader();
    this.userService.getData(`Feedback/GetPreviousFeedbacks?internId=${id}`).subscribe(res => {
      this.totalFeedbacks = res;
      this.loader.hideLoader();
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error(error.message);
        if (!error.message) {
          this.alert.error("An error occured while getting feedback.")
        }
      });
  }
  /**
 * Updates the view with the updated overall feedback for a specific intern.
 * @param feedback The updated overall feedback data.
 * @param internId The unique identifier of the intern.
 */
  UpdateOverallFeedbackView(feedback: overallFeedback, internId: string) {
    this.loader.showLoader();
    const index = this.feedbacks.findIndex((intern) => intern.id === internId);
    if (index !== -1) {
      this.feedbacks[index].overallFeedback = feedback;
    }
    this.loader.hideLoader();
  }
  /**
 * Publishes the feedback for a specific intern.
 * @param internId The unique identifier of the intern.
 * @param feedbackId The unique identifier of the feedback to be published.
 */
  PublishFeedback(internId: string, feedbackId: string) {
    this.loader.showLoader();
    this.userService.getData(`Feedback/PublishFeedback?feedbackId=${feedbackId}`).subscribe(res => {
      const index = this.feedbacks.findIndex((intern) => intern.id === internId);
      if (index !== -1) {
        this.feedbacks[index].overallFeedback = res;
      }
      this.loader.hideLoader();
      this.alert.success("Feedback published successsfully")
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error(error.message);
        if (!error.message) {
          this.alert.error("An error occured while publishing feedback.")
        }
      });
  }

  /**
 * Publishes all feedbacks associated with the selected batch.
 * Upon receiving the updated feedbacks from the backend, updates the corresponding feedback objects in the frontend.
 */
  PublishAllFeedbacks() {
    this.loader.showLoader();
    this.userService.changeData(`Feedback/PublishAllFeedbacks?batchId=${this.selectedBatchId}`, "").subscribe((res: overallFeedback[]) => {
      res.forEach(feedback => {
        const index = this.feedbacks.findIndex(intern => intern.id === feedback.internId);
        if (index !== -1) {
          this.feedbacks[index].overallFeedback = feedback;
        }
      })
      this.loader.hideLoader();
      this.alert.success("All feedbacks published successsfully")

    },
      (error) => {
        this.loader.hideLoader();
        if (error && error.error && error.error.message) {
          this.alert.error(error.error.message);
        } else {
          this.alert.error("An error occurred while publishing feedback.");
        }
      }
    );
  }

  /**
   * Method is to get the intern feedback button status.
   */
  loadFeedbackStatuses(): void {
    const internIds = this.feedbacks.map(item => item.id);
    internIds.forEach(internId => {
      this.userService.getData(`Feedback/GetInternFeedbackExist?internId=${internId}&batchName=${this.selectedBatchName}`).subscribe((res) => {
        this.feedbackStatus[internId] = res;
      });
    });
  }
}

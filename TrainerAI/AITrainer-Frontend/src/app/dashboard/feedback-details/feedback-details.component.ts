import { Component } from '@angular/core';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/Services/user.service';
import { FeedbackFiltersDTO, feedbackDetails, feedbackList, CareerPath  } from 'src/app/model/feedback';
import { Router } from '@angular/router';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { batch } from 'src/app/model/internship';
import { LoaderService } from 'src/app/loader/loader.service';
import { courseList } from 'src/app/model/Course';


@Component({
  selector: 'app-feedback-details',
  templateUrl: './feedback-details.component.html',
  styleUrls: ['./feedback-details.component.css']
})
export class FeedbackDetailsComponent {
  internIdList!: string[];
  feedback!: feedbackDetails[];
  feedbackList!: feedbackList[];
  feedbackLength!: number;
  batchName!: string;
  selectedBatchId!: string;
  internsName: string[] = [];
  courses: courseList[] = [];
  careerPaths: CareerPath[] = [];
  reviewers: string[] = [];
  feedbackFilters!: FeedbackFiltersDTO;
  filterStatus: boolean = false;
  showFullText: boolean = false;
  selectbatchform!: FormGroup;
  batches!: batch[];
  currentPage: number = 1;
  defaultList: number = 5;
  totalPage: number = 0;
  pageNumbers: number[] = [];
  visiblePages: number = 3;


  constructor(private readonly router: Router, private readonly userService: UserService, private readonly formBuilder: FormBuilder,
    private tableLoader: LoaderTableService, private loader: LoaderService, private alert: AlertToasterService) { }
  ngOnInit(): void {
    this.feedbackFilters = {
      careerPaths: [],
      courses: [],
      reviewers: [],
      name: []
    };
    this.initSubmitForm();
    this.getBatch();
    this.getCareerPaths();
    this.getCourses();

  }

  /** Update visible no of page number to navigate to any page.  */
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
* Load internship details of that particular page number.
* @param pageNumber : pagination page number.
*/
  goToPage(pageNumber: number) {
    this.tableLoader.showLoader();
    this.feedback = [];
    this.currentPage = pageNumber;
    this.userService.getFileData(`Internship/GetInternOverAllFeedbackForAll`, { params: { internIds: this.internIdList, type: "Table", batchName: this.batchName, careerPath: this.feedbackFilters.careerPaths, course: this.feedbackFilters.courses, reviewer: this.feedbackFilters.reviewers, internName: this.feedbackFilters.name,currentPage: this.currentPage, defaultList: this.defaultList } }).
      subscribe((res) => {
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
        this.feedback = res.allInternsFinalFeedbacks;
        if (!this.filterStatus) {
          this.reviewers = Array.from(new Set(this.feedback.flatMap(detail => detail.feedbackList.map(feedback => feedback.reviewerName ?? ''))));
          this.internsName.sort((a, b) => a.localeCompare(b));
          this.courses.sort((a, b) => a.name.localeCompare(b.name));
          this.reviewers.sort((a, b) => a.localeCompare(b));
        }
        this.feedbackLength = this.feedback.length;
        this.tableLoader.hideLoader()
      },
        (error) => {
          this.tableLoader.hideLoader();
          this.alert.error("Some error occured. Please try again later")
        });
  }

  /**Load next internship details list. */
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

  /**Load previous page internship details list. */
  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    }
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
 API call to get all available Batches
 */
  getBatch() {
    this.tableLoader.showLoader();
    this.userService.getData("Batch/ListBatch").subscribe((res: batch[]) => {
      this.batches = res;
      this.tableLoader.hideLoader();
      if (this.batches && this.batches.length > 0) {
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
        }
        this.Select();
        this.getInterns();
      }
    },
      (error) => {
        this.tableLoader.hideLoader();
        this.alert.error("Some error occured. Please try again later");
      });
  }
  /*
  Method that is called whenever there is any  change in value of Select
  */
  Select() {
    this.feedbackFilters = { careerPaths: [], courses: [], reviewers: [], name: [] };
    const checkboxes = document.querySelectorAll('.form-check-input');
    checkboxes.forEach((value) => {
        const checkbox = value as HTMLInputElement;
        checkbox.checked = false;
    });
    const selectedBatch = this.selectbatchform.get('batch')?.value;
    if (selectedBatch) {
      this.selectedBatchId = selectedBatch.toString();
      localStorage.setItem('selectedBatch', JSON.stringify(selectedBatch));
      this.userService.getData(`Batch/GetBatchById?id=${this.selectedBatchId}`).subscribe((res) => {
        this.batchName = res.batchName;
      });
      this.userService.getData(`Feedback/GetFeedback?batchId=${this.selectedBatchId}`).subscribe((res) => {
        this.internIdList = res.map((detail: { id: string; }) => detail.id);
        if (this.internIdList.length != 0) {
          
          this.GetOverAllFeedback();

        }
        else {
          this.tableLoader.hideLoader();
          this.feedbackLength = 0;
          this.feedback = [];
        }


      },
        (error) => {
          this.tableLoader.hideLoader();
          this.alert.error("Some error occured. Please try again later")
        });
    }
    this.getInterns();
  }


  /**
   * Function to display the overall feedback
   */
  GetOverAllFeedback() {
    
    this.tableLoader.showLoader();
    const careerPathIds = this.feedbackFilters.careerPaths.map(cp => cp);
    if(this.internIdList.length)
    this.userService.getFileData(`Internship/GetInternOverAllFeedbackForAll`, { 
      params: { 
        internIds: this.internIdList, 
        type: "Table", 
        batchName: this.batchName, 
        careerPaths: this.feedbackFilters.careerPaths, 
        course: this.feedbackFilters.courses, 
        reviewer: this.feedbackFilters.reviewers, 
        internName: this.feedbackFilters.name, 
        currentPage: this.currentPage, 
        defaultList: this.defaultList 
      } 
    }).subscribe((res) => {
      this.totalPage = res.totalPages;
      this.updateVisiblePages();
      this.feedback = res.allInternsFinalFeedbacks;
      const allFeedbackListsNull = this.feedback.every(detail => detail.feedbackList.every(feedback => !feedback));
      if (allFeedbackListsNull) {
        this.feedbackLength = 0;
        this.tableLoader.hideLoader();
        return;
      }
      if (!this.filterStatus) {
       this.reviewers = Array.from(new Set(this.feedback.flatMap(detail => detail.feedbackList.map(feedback => feedback.reviewerName ?? ''))));
        this.internsName.sort((a, b) => a.localeCompare(b));
        this.courses.sort((a, b) => a.name.localeCompare(b.name));

        this.reviewers.sort((a, b) => a.localeCompare(b));
      }
      this.feedbackLength = this.feedback.length;
      this.tableLoader.hideLoader()
    }, (error) => {
      this.tableLoader.hideLoader();
      this.alert.error("Some error occured. Please try again later")
    });
    else{
      this.tableLoader.hideLoader();
    }
  }

  /**
  * Processes the feedback provided by removing special characters.
  * @param feedback The feedback of intern.
  * @returns The processed feedback with special characters removed.
  */
  preprocessFeedback(feedback: string | null | undefined): string {
    if (feedback == null) {

      return '';
    }

    return feedback.replace(/@#|%\$+/g, '');
  }

  /**
   * Function to navigate to the feedback dashboard page
   */
  handleBack() {
    this.router.navigate(['/dashboard/feedback-dashboard']);
  }

  /**
   * Function to download all feedback details in excel file
   */
  GetOverAllFeedbackFile() {
    this.tableLoader.showLoader();
    const interns = this.internIdList;
    this.userService.getFileData(`Internship/GetInternOverAllFeedbackForAll`, { params: { internIds: this.internIdList, type: "Excel", batchName: this.batchName, careerPath: this.feedbackFilters.careerPaths, course: this.feedbackFilters.courses, reviewer: this.feedbackFilters.reviewers } }).
      subscribe((res) => {
        const binaryData = atob(res.file.fileContents);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([arrayBuffer], { type: res.file.contentType });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = res.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.tableLoader.hideLoader();
        this.alert.success('Feedback successfully downloaded!');

      },
        (error) => {
          this.tableLoader.hideLoader();
          this.alert.error("Some error occured while downloading. Please try again later")
        })
  }


  /**
 *  Handles the selection of a career path by updating the feedback filters accordingly.
 * @param event The event triggered by the selecting careerpath.
 * @param careerPath The selected career path.
 */
  handleCareerPathSelection(event: Event, careerPath: string) {
    this.filterStatus = true;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.feedbackFilters.careerPaths.push(careerPath);
    } else {
      this.feedbackFilters.careerPaths = this.feedbackFilters.careerPaths.filter(
        (item) => item !== careerPath
      );
    }
    this.GetOverAllFeedback();
  }
  

  /**
 * Checks if a career path is already selected.
 * 
 * @param careerPath The career path to check for selection status.
 * @returns A boolean indicating whether the specified career path is already selected.
 */
  isCareerPathSelected(careerPath: string): boolean {
    return this.feedbackFilters.careerPaths.some(
      (item) => item === careerPath
    );
  }
   /**
   *  Handles the selection of a course by updating the feedback filters accordingly
   * @param event The event triggered by the selecting course.
   * @param course The selected course
   */
  handleCourseSelection(event: Event, course: string) {
    this.filterStatus = true;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.feedbackFilters.courses.push(course);
    } else {
      this.feedbackFilters.courses = this.feedbackFilters.courses.filter(
        (item) => item !== course
      );
    }
    this.GetOverAllFeedback();
  }

  /**
   * Handles the selection of a reviewer by updating the feedback filters accordingly
   * @param event The event triggered by the selecting reviewer.
   * @param reviewer The selected reviewer
   */
  handleReviewerSelection(event: Event, reviewer: string) {
    this.filterStatus = true;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.feedbackFilters.reviewers.push(reviewer);
    } else {
      this.feedbackFilters.reviewers = this.feedbackFilters.reviewers.filter(
        (item) => item !== reviewer
      );
    }
    this.GetOverAllFeedback();
  }


  /**
   * Handles the selection of a intern by updating the feedback filters accordingly
   * @param event The event triggered by the selecting intern.
   * @param intern he selected intern
   */
  handleNameSelection(event: Event, intern: string) {
    this.filterStatus = true;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.feedbackFilters.name.push(intern);
    } else {
      this.feedbackFilters.name = this.feedbackFilters.name.filter(
        (item) => item !== intern
      );
    }
    this.GetOverAllFeedback();
  }

  /**
 * Determines whether the "Read more" link should be displayed based on the length of the feedback text.
 * @param text The feedback text to be displayed.
 * @returns A boolean indicating whether the "Read more" link should be displayed.
 */
  shouldDisplayReadMore(text: string | undefined | null): boolean {
    return !!text && text.length > 100;
  }

  /**
   * Toggles the display of full text for a specific field within a feedback item.
   * @param feedbackItem  The feedback item for which the full text display is toggled.
   * @param field The field within the feedback item for which the full text display is toggled.
   */
  toggleShowFullText(feedbackItem: feedbackList, field: string): void {
    if (field === 'improvementArea') {
      feedbackItem.showFullText = !feedbackItem.showFullText;
      feedbackItem.showLessImprovementArea = !feedbackItem.showLessImprovementArea;
    } else if (field === 'comment') {
      feedbackItem.showFullText = !feedbackItem.showFullText;
      feedbackItem.showLessComment = !feedbackItem.showLessComment;
    }
    if (field === 'feedback') {
      feedbackItem.showFullText = !feedbackItem.showFullText;
      feedbackItem.showLessFeedback = !feedbackItem.showLessFeedback;
    }
  }
  /**
   * To refresh  page and remove all filters
   */
  reset() {
    this.feedbackFilters = { careerPaths: [], courses: [], reviewers: [], name: [] };
    const checkboxes = document.querySelectorAll('.form-check-input');
    checkboxes.forEach((value) => {
        const checkbox = value as HTMLInputElement;
        checkbox.checked = false;
    });
      this.GetOverAllFeedback();
   
  }


  /**
 * Fetches the list of available career paths from the server.
 * Updates the component's 'careerPaths' property with the received data.
 */
  getCareerPaths() {
    this.userService.getData(`CareerPath/ListCareerPaths`).subscribe((res) => {
      this.careerPaths = res;
    });
  }

  /**
   * Fetches the list of all interns in the batch
   * Updates internsName with the received
   */
  getInterns(){
    this.userService.getData(`Batch/InternsInBatch?batchId=${this.selectedBatchId}`).subscribe((res) => {
      this.internsName = res;
      }, (error) => {
        this.tableLoader.hideLoader();
      });
  }
    /**
   * Retrieves the list of courses.
   */
    getCourses() {
      this.userService.getData(`Course/GetCoursesList`).subscribe((res) => {
        this.courses = res;
               
      });
    }

}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { HttpService } from 'src/Services/http.service';
import { courseList } from 'src/app/model/Course';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { StringConstant } from 'src/app/model/string-constants';
import { StringConstants } from 'src/app/shared/string-constants';
import { AlertDialogService } from 'src/app/alert-dialog/alert-dialog.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css'],
})
export class CourseComponent implements OnInit {
  create_editCourseForm!: FormGroup;
  showDetails!: boolean;
  formHeading!: string;
  selectedCourse: courseList | null = null;
  courseList!: courseList[];
  isAllDeleted: boolean = false;
  lists: any[] = [];
  defualtList: number = 10;
  currentPage: number = 1;
  pageNumbers: number[] = [];
  visiblePages: number = 3;
  totalPage: number = 0;
  isEditingCourse: boolean = false;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  constantString = StringConstants;
  trainingLevelOptions: string[];

  readonly DeleteCourse = StringConstant.deleteCourse;
  readonly AreYouSure = StringConstant.areYousureText;
  readonly Delete = StringConstant.delete;
  readonly Close = StringConstant.close;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private loader: LoaderService,
    private tableLoader: LoaderTableService,
    private alert: AlertToasterService,
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
    private alertDialogService: AlertDialogService
  ) {
    this.hasPreviousPage = false;
    this.hasNextPage = true;
    this.trainingLevelOptions = experienceLevels;
    this.initCourseForm();
  }

  ngOnInit(): void {
    this.setShowdetails();
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1;
      this.getCourseList();
    });
    localStorage.setItem('coursePageNo', this.currentPage.toString());
    //get current form value and update form
    if (this.create_editCourseForm) {
      this.create_editCourseForm
        .get('quiz')
        ?.valueChanges.subscribe((value) => {
          this.updateValidators(value);
        });
    }
  }

  /**
   * Method to initialize form
   */
  initCourseForm() {
    this.create_editCourseForm = this.formBuilder.group(
      {
        id: [''],
        name: ['', Validators.required],
        durationType: ['Days'],
        //  duration: ['', [Validators.required]],
        duration: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        quiz: [false],
        quizCount: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        quizTime: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        quizMarks: [
          '',
          [
            Validators.required,
            Validators.min(1),
            Validators.pattern('^[1-9][0-9]*$'),
          ],
        ],

        trainingLevel: ['Fresher'],
      },
      { validators: this.quizFieldsValidator }
    );
  }

  /**
   * updates validation at the time quiz selection.
   * @param selectedValue The selected quiz value.
   * @returns bool value true or false
   */
  updateValidators(selectedValue: boolean) {
    const quizCount = this.create_editCourseForm.get('quizCount');
    const quizTime = this.create_editCourseForm.get('quizTime');
    const quizMarks = this.create_editCourseForm.get('quizMarks');
    const trainingLevel = this.create_editCourseForm.get('quizTime');

    if (!selectedValue) {
      quizCount?.clearValidators();
      quizTime?.clearValidators();
      quizMarks?.clearValidators();
      trainingLevel?.clearValidators();
    } else {
      quizCount?.setValidators([Validators.required]);
      quizTime?.setValidators([Validators.required]);
      quizMarks?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.pattern('^[1-9][0-9]*$'),
      ]);
      trainingLevel?.setValidators([Validators.required]);
    }
  }

  /**
   * Subscribes to router events to determine whether to show details
   * based on the current router URL. If the URL matches '/dashboard/courses',
   * it sets `showDetails` to false; otherwise, it sets it to true.
   */
  setShowdetails() {
    this.router.events.subscribe((event) => {
      if (this.router.url == '/dashboard/courses') {
        this.showDetails = false;
      } else {
        this.showDetails = true;
      }
    });
  }

  /**
   * Method to create course
   * @returns void
   *
   */
  createCourse(): void {
    if (this.create_editCourseForm.valid) {
      const quizCountValue = Number(this.create_editCourseForm.value.quizCount);
      const quizValue = this.create_editCourseForm.value.quiz == true;
      const quizTimeValue = Number(this.create_editCourseForm.value.quizTime);
      const quizQuestionMarks = Number(
        this.create_editCourseForm.value.quizMarks
      );
      const durationValue = Number(this.create_editCourseForm.value.duration);

      const data = {
        ...this.create_editCourseForm.value,
        quizCount: quizCountValue,
        quiz: quizValue,
        quizTime: quizTimeValue,
        quizMarks: quizQuestionMarks,
        quizDuration: quizTimeValue,
      };
      this.loader.showLoader(
        'Please wait while we are creating this course. This may take few minutes...'
      );
      this.userService.postData('Course/createCourse', data).subscribe(
        (res) => {
          if (res.message) {
            this.alertDialogService.openAlertDialog(res.message);// Show success message in an alert Dailog
            this.getCourseList(); // Call the getCourseList() method after successful course creation
            this.create_editCourseForm.reset(); // Reset the form values
            this.loader.hideLoader();
            this.create_editCourseForm.get('quiz')?.setValue(false);
          }
        },
        (error: HttpErrorResponse) => {
          this.create_editCourseForm.reset();
          // Check if the error response contains the 'error' property
          if (error.error && error.error.error) {
            const errorMessage = error.error.error;
            this.alert.error(error.error);
            this.alert.error(errorMessage); // Show error message in an alert box
            this.loader.hideLoader();
            this.create_editCourseForm.get('quiz')?.setValue(false);
          } else {
            // Show a generic error message in an alert box
            this.alert.error('An error occurred while creating the course.');
            this.loader.hideLoader();
            this.create_editCourseForm.reset();
            this.create_editCourseForm.get('quiz')?.setValue(false);
          }
        }
      );
    } else {
      this.alert.error('Please enter valid form values');
    }
  }

  /**
   * Fetches the course list from the server based on the current page and default list.
   * It shows a loader during the data fetching process, then updates the course list,
   * total pages, and visible pages. Also manages the next/previous buttons state.
   *
   * @returns void
   */
  getCourseList(): void {
    this.tableLoader.showLoader();
    this.userService
      .getData(
        `Course/GetCourse?currentPage=${this.currentPage}&defualtList=${this.defualtList}`
      )
      .subscribe((res) => {
        this.totalPage = res.totalPages;
        this.courseList = res.data;
        this.updateVisiblePages();
        this.tableLoader.hideLoader();
      });
    this.updateNextPrevButtons();
  }

  /** */
  selectToDelete(course: courseList) {
    this.selectedCourse = course;
  }

  /**
   * Deletes the selected course by its ID.
   * If a course is selected, it sends a delete request to the server.
   * Upon successful deletion, it removes the course from the course list,
   * displays a success alert, and checks if all courses in the list are marked as deleted.
   * The loader is shown during the delete operation and hidden after completion.
   *
   * @returns void
   */
  deleteCourse(): void {
    if (this.selectedCourse) {
      let courseId = this.selectedCourse.id;
      this.tableLoader.showLoader();
      this.userService
        .deleteData(`Course/DeleteCourse?courseId=${courseId}`)
        .subscribe((res) => {
          if (res) {
            const indexToRemove = this.courseList.findIndex(
              (course) => course.id === courseId
            );
            this.alert.success('Course deleted successfully');
            if (indexToRemove !== -1) {
              this.courseList.splice(indexToRemove, 1);
            }
            if (this.courseList) {
              this.isAllDeleted = this.courseList.every(
                (user) => user.isDeleted
              );
            }
          }
        });
      this.tableLoader.hideLoader();
    }
  }

  /**
   * Navigates to a specific page of the course list
   * @param pageNumber The page number to navigate to
   */
  goToPage(pageNumber: any) {
    // Update the current page
    this.currentPage = pageNumber;

    // Fetch the course data for the specified page
    this.userService
      .getData(
        `Course/GetCourse?currentPage=${pageNumber}&defualtList=${this.defualtList}`
      )
      .subscribe((res) => {
        // Update the course list with the new data
        this.courseList = res.data;
        // Update the visible page numbers
        this.updateVisiblePages();
      });

    // Update the URL with the new page number
    this.router.navigate([], {
      queryParams: { page: pageNumber },
      queryParamsHandling: 'merge',
    });

    // Store the current page number in local storage
    localStorage.setItem('coursePageNo', pageNumber);

    // Update the next and previous button states
    this.updateNextPrevButtons();
  }

  /**
   * Methos is for disable previous button when user on first page and disabled next button when user on last page.
   */
  updateNextPrevButtons(): void {
    this.hasPreviousPage = this.currentPage > 1;
    this.hasNextPage = this.currentPage < this.totalPage;
  }

  /**
   * Updates the array of visible page numbers for pagination.
   * Calculates the start and end pages based on the current page and the total number of pages.   *
   * The method divides the visible pages by half to determine the range of pages to show. It then adjusts the
   *
   * @returns void
   */
  updateVisiblePages(): void {
    const halfVisible = Math.floor(this.visiblePages / 2);
    const startPage = Math.max(1, this.currentPage - halfVisible);
    const endPage = Math.min(this.totalPage, startPage + this.visiblePages - 1);

    this.pageNumbers = [];

    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }

  /**
   * method to move to next page
   * @return void
   */
  next(): void {
    if (this.currentPage < this.totalPage) {
      this.currentPage++;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    } else {
      this.currentPage++;
      this.goToPage(this.currentPage);
    }
  }

  /**
   * method to move previous page
   * @returns void
   */
  previous(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    }
  }

  /**
   * Custom validator that checks if the quiz is selected, and ensures that the quiz count, time, and marks fields are filled.
   * Returns a validation error if any of these fields are missing when the quiz is selected.
   *
   * @param control - The form group to validate.
   * @returns ValidationErrors | null - An error object if validation fails, otherwise null.
   */
  quizFieldsValidator(control: AbstractControl): ValidationErrors | null {
    const isQuizSelected = control.get('quiz')?.value === true;
    if (isQuizSelected) {
      const quizCount = control.get('quizCount')?.value;
      const quizTime = control.get('quizTime')?.value;
      const quizMarks = control.get('quizMarks')?.value;

      if (!quizCount || !quizTime || !quizMarks) {
        return { quizFieldsRequired: true };
      }
    }

    return null;
  }

  /**
   *close the method and reset the from
   @returns void
   */
  closeCourseForms(): void {
    this.create_editCourseForm.reset({
      name: '',
      durationType: 'Days',
      duration: '',
      quiz: false,
      quizCount: '',
      quizTime: '',
      quizMarks: '',
      trainingLevel: 'Fresher',
    });
    this.isEditingCourse = false;
  }

  /**
   * Retrieves the form control for the given control name from the `create_editCourseForm` form group.
   *
   * @param controlName - The name of the form control to retrieve.
   * @returns AbstractControl | null - The form control if found, otherwise null.
   */
  getControl(controlName: string): AbstractControl | null {
    return this.create_editCourseForm.get(controlName);
  }

  /**
   * Enables course editing mode and populates the course form with the selected course details.
   * It sets the `isEditingCourse` flag to true and updates the form with the course data.
   *
   * @param course - The selected course object containing the course details to be edited.
   * @returns void
   */
  editCourseForm(course: courseList): void {
    this.isEditingCourse = true;
    this.create_editCourseForm.patchValue(course);
  }

  /**
   *method to submit edited course
   @returns void
   */
  editCourse(): void {
    const data = {
      CourseId: this.create_editCourseForm.get(this.constantString.id)?.value,
      Name: this.create_editCourseForm.get('name')?.value,
    };
    this.httpService.put(`Course/EditCourse`, data).subscribe((res) => {
      const foundCourseIndex = this.courseList.findIndex(
        (course) => course.id === data.CourseId
      );
      if (foundCourseIndex !== -1) {
        this.courseList[foundCourseIndex] = res;
      }
    });
  }
}

export const experienceLevels = ['Fresher', 'Junior', 'Experienced'];

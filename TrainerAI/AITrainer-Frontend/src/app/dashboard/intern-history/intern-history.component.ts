import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Course, CourseSelectionDto, InternshipDataDto, TopicInfo } from 'src/app/model/history';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-intern-history',
  templateUrl: './intern-history.component.html',
  styleUrls: ['./intern-history.component.css'],
})
export class InternHistoryComponent implements OnInit {
  historyData: TopicInfo[] = [];
  topicNames: string[] = [];
  activeCourse: any;
  allCourseList!: Course[];
  selectCourse!: FormGroup;
  internshipId!: string;
  templateStatus: boolean = false;
  courseEndDate!: string;
  assignmentId!: string;

  constructor(
    private userService: UserService,
    private loader: LoaderTableService,
    private alert: AlertToasterService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getRoutePerameter();
    this.initSubmitForm();
  }

  /**
   * method to initialize the form
   * @retun void
   */
  initSubmitForm(): void {
    this.selectCourse = this.formBuilder.group({
      courseSelectId: ['', Validators.required],
      internshipId: [''],
    });
  }

  /**
   * method to get router param from history details
   *@returns void
   */
  getRoutePerameter(): void {
    this.route.queryParams.subscribe(params => {
      const internshipId = params['internshipId'];
      const courseObj = {
        courseSelectId: this.assignmentId,
        internshipId: internshipId
      }

      if (internshipId !== undefined) {
        this.selectCourseHandle(courseObj);
      }
      else {
        this.getHistory();
      }
    });

  }

  /**
 * Fetches internship history data for the user from the API.
 * It handles active and all courses, updates form controls based on the response,
 * and manages template and course status. A loader is shown while the data is fetched,
 * and hidden once the process completes, regardless of success or error.
 * @returns void
 */
  getHistory(): void {
    this.loader.showLoader();
    this.userService.getData('Interndashboard/Internhistory')
      .pipe(
        finalize(() => this.loader.hideLoader())
      )
      .subscribe({
        next: (res: InternshipDataDto) => {
          this.activeCourse = res.activeCourseName;
          this.allCourseList = res.allCourseName;
          this.internshipId = res.internshipId;

          this.selectCourse.patchValue({
            internshipId: this.internshipId,
          });

          if (this.activeCourse) {
            this.selectCourse.patchValue({
              courseSelectId: this.activeCourse.courseId,
              internshipId: this.activeCourse.internshipId,
            });
            this.selectCourseHandle(this.selectCourse.value);
          } else {
            this.selectCourse.patchValue({
              courseSelectId: this.allCourseList[0].courseId,
              internshipId: this.allCourseList[0].internshipId,
            });
            this.selectCourseHandle(this.selectCourse.value);
          }

          this.checkTemplateStatus(this.allCourseList[0].courseId);
          this.historyData = res.topicInfo;
          this.internshipId = res.internshipId;
          this.courseEndDate = res.endDate;

        },
        error: (error: HttpErrorResponse) => {
          const errorMessage = error.error.message;
          if (errorMessage !== 'Not found any History') {
            this.alert.error(errorMessage);
          }
        }
      });
  }


  /**
 * Splits the topic name of a selected course history item into individual topics.
 * The topic names are separated by commas and stored as an array of trimmed strings.
 *
 * @param index - The index of the selected course history item in the `historyData` array.
 * @returns void
 */
  openToggle(index: number): void {
    this.topicNames = this.historyData[index].topic.topicName
      .split(',')
      .map((item: string) => item.trim());
  }


  /**
 * Handles course selection and fetches the intern's course history based on the selected internship ID.
 * Updates the active course, course list, and other course-related data.
 * Displays an error message if the data fetch fails.
 * Ensures the loader is displayed while data is being fetched and hides it once complete.
 * @returns void
 */
  selectCourseHandle(data: CourseSelectionDto): void {
    this.loader.showLoader();
    this.userService
      .getData(`Interndashboard/Internhistory?internshipId=${data.internshipId}`)
      .pipe(
        finalize(() => this.loader.hideLoader())
      )
      .subscribe({
        next: (res) => {
          this.activeCourse = res.activeCourseName;
          this.internshipId = res.internshipId;
          if (!this.allCourseList || this.allCourseList.length === 0) {
            this.allCourseList = res.allCourseName;
          }

          this.selectCourse.patchValue({
            courseSelectId: data.courseSelectId,
            internshipId: res.internshipId,
          });

          this.checkTemplateStatus(data.courseSelectId);
          this.historyData = res.topicInfo;
          this.courseEndDate = res.endDate;
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            const errorMessage = error.error.message;
            this.alert.error(errorMessage);
          }
        }
      });
  }

  /**
 * Checks the journal template status for a specific course based on the course ID.
 * Sends a request to retrieve the template status, and sets the `templateStatus`
 * property to `true` if the template exists, or `false` if it doesn't.
 *
 * @param courseId - The ID of the course to check for a journal template status.
 * @returns void
 */
  checkTemplateStatus(courseId: string): void {
    this.userService
      .getData(`JournalTemplate/GetTemplateStatus?courseId=${courseId}`)
      .subscribe((res) => {
        if (res == true) {
          this.templateStatus = true;
        } else {
          this.templateStatus = false;
        }
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/Services/user.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { courseList } from 'src/app/model/Course';
import { Detail_Fields, adminInfo, internDetails, userList } from 'src/app/model/intern';
import { Mentor } from 'src/app/model/mentor';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StringConstant } from 'src/app/model/string-constants';

@Component({
  selector: 'app-mentor-dashboard',
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css'],
})

export class MentorDashboardComponent implements OnInit {

  readonly filterBatch = StringConstant.filterBatch;

  constructor(
    private userService: UserService,
    private loader: LoaderService,
    private formBuilder: FormBuilder,
    private tableLoader: LoaderTableService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.courseSelectedValues = [];
    this.mentorSelectedValues = [];
  }

  ngOnInit() {
    this.searchCourseForm = this.formBuilder.group({
      searchCourse: '',
    });
    this.searchMentorForm = this.formBuilder.group({
      searchMentor: '',
    });
    this.filterForm = this.formBuilder.group({
      search: '',
    });
    this.getAdmin();
    this.getBatches();
    this.getCourses();
    this.getMentors();
    this.getAdminList();

  }

  batchFilterButtonText: string = this.filterBatch;
  batches: any;
  mentorList: Mentor[] = [];
  courses!: courseList[];
  batchId: string | null = '';

  detail_fields: Detail_Fields = {
    internshipCount: 0,
    submissionCount: 0,
    unSubmittedCount: 0,
    publishedCount: 0,
    unpublishedCount: 0,
  };
  selectedCourses: courseList[] = [];
  selectedMentors: Mentor[] = [];
  internDetails: internDetails[] = [];
  searchCourseForm!: FormGroup;
  searchMentorForm!: FormGroup;
  searchCourseKeyword: string | null = '';
  searchMentorKeyword: string | null = '';
  adminDetail!: adminInfo;
  currentPage: number = 1;
  defaultList: number = 10;
  totalPage: number = 0;
  users: userList[] = [];
  pageNumbers: number[] = [];
  visiblePages: number = 3;
  searchWord: string = '';
  filterForm!: FormGroup;
  showMentorSection: boolean = false;
  showOrginalDashboardSection: boolean = true;
  courseSelectedValues: string[];
  mentorSelectedValues: string[];

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

  search(data: { search: string }) {
    if (data) {
      this.tableLoader.showLoader();
      this.searchWord = data.search;
      this.currentPage = 1;
      this.getAdminList();
    } else {
      this.reset();
    }
    this.tableLoader.hideLoader();
  }

  reset(): void {
    this.searchWord = '';
    this.filterForm.reset();
    this.getAdminList();
  }

  /**
   * Method is to reset the intern assignment mentor dashboard.
   */
  resetMentorAssignmentDashbord(): void {
    this.selectedCourses = [];
    this.selectedMentors = [];
    this.courseSelectedValues = [];
    this.mentorSelectedValues = [];
    this.internDetails = [];
    this.detail_fields.internshipCount = 0;
    this.detail_fields.publishedCount = 0;
    this.detail_fields.submissionCount = 0;
    this.detail_fields.unSubmittedCount = 0;
    this.detail_fields.unpublishedCount = 0;
    this.batchFilterButtonText = this.filterBatch;
    this.batchId = '';
    this.searchCourseForm.get('searchCourse')?.setValue('');
    this.searchCourseKeyword = '';
    this.searchMentorForm.get('searchMentor')?.setValue('');
    this.searchMentorKeyword = '';
    this.getBatches();
    this.getCourses();
    this.getMentors();
  }

  getAdminList() {
    this.loader.showLoader();
    this.userService
      .getData(
        `MentorDashboard/list-admin?currentPage=${this.currentPage}&defaultList=${this.defaultList}&searchWord=${this.searchWord}`
      )
      .subscribe((res) => {
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
        this.users = [];
        this.users = res.adminProfiles;
        this.loader.hideLoader();
      },
        error => {
          this.loader.hideLoader();


        });
  }

  getAdmin() {
    this.userService.getData(`Intern/getAdminDetail`).subscribe((res) => {
      this.adminDetail = res;
    });
  }

  getCourses() {
    this.userService
      .getCourses(
        `MentorDashboard/GetCourses?batchId=${this.batchId}&keyWord=${this.searchCourseKeyword}`
      )
      .subscribe({
        next: (res) => {
          this.courses = res;
        },
      });
  }

  /**
 * Load mentors of that particular page number.
 * @param pageNumber : pagination page number.
 */
  goToPage(pageNumber: number) {
    this.tableLoader.showLoader();
    this.users = [];
    this.currentPage = pageNumber;
    this.userService
      .getData(
        `MentorDashboard/list-admin?currentPage=${pageNumber}&defaultList=${this.defaultList}&searchWord=${this.searchWord}`
      )
      .subscribe((res) => {

        this.users = res.adminProfiles;
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
        this.tableLoader.hideLoader();
      });
  }

  /**Load next page mentors list. */
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

  /**Load previous page mentors list. */
  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    }
  }
  /**
   * Method to fetch list of mentors based on parameters such as courseId and keyword.
   */
  getMentors() {
    this.userService
      .getMentors(`MentorDashboard/GetMentors`, {
        params: {
          CourseIds: this.selectedCourses.map((course) => course.id),
          KeyWord: this.searchMentorKeyword,
          BatchId: this.batchId
        },
      })
      .subscribe((res) => {
        this.mentorList = res;
      });
  }

  /**
   * Method to fetch internship data based on parameters such as batch, course and mentor
   */
  getInternshipData() {
    this.userService
      .getInternshipDetailsData(`MentorDashboard/GetInternships`, {
        params: {
          batchId: this.batchId,
          CourseId: this.selectedCourses.map((course) => course.id),
          MentorId: this.selectedMentors.map((mentor) => mentor.mentorId),
        },
      })
      .subscribe((res) => {
        this.internDetails = res.internshipDetail;
        this.detail_fields = res.totalCount;
        this.loader.hideLoader();
      });
  }

  /**
   * Method to fetch courses based on batch Id
   * @param batchName Name of batch
   * @param batchId Id of batch
   */

  setBatchName(batchName: string, batchId: string) {
    this.batchFilterButtonText = batchName;
    this.batchId = batchId;
    this.getCourses();
    this.getInternshipData();
  }

  /**
 * Toggles the display of sections based on the type of administrator.
 * If the administrator type is 'Technical Administrator', the mentor section is shown, and the original dashboard section is hidden.
 * If the administrator type is not 'Technical Administrator', the mentor section is hidden.
 */
  toggleCodeDisplay() {
    if (this.adminDetail.type === 'Technical Administrator') {
      this.showMentorSection = true;
      this.showOrginalDashboardSection = false;
    } else {
      this.showMentorSection = false;
    }
  }

  goBack() {
    this.showMentorSection = false;
    this.showOrginalDashboardSection = true;
  }


  /**
   * Handles the change event of a course checkbox.
   * @param event The change event object.
   * @param course The course object associated with the checkbox.
   */
  handleCourseCheckboxChange(event: Event, course: courseList) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedCourses.push(course);
      this.courseSelectedValues.push(course.id);
    } else {
      this.selectedCourses = this.selectedCourses.filter(
        (item) => item !== course
      );
      this.courseSelectedValues = this.courseSelectedValues.filter(id => id !== course.id);
    }
    this.getMentors();
    this.getInternshipData();
  }

  /**
   * Method is to check the course is selected or not.
   * @param course Course object with details.
   * @returns True if selected and false if not selected.
   */
  isCourseChecked(course: courseList): boolean {
    const value = this.courseSelectedValues.includes(course.id);
    return value;
  }

  /**
   * Handles the change event of a mentor checkbox.
   * @param event The change event object.
   * @param mentor The mentor object associated with the checkbox.
   */

  handleMentorCheckboxChange(event: Event, mentor: Mentor) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedMentors.push(mentor);
      this.mentorSelectedValues.push(mentor.mentorId);
    } else {
      this.selectedMentors = this.selectedMentors.filter(
        (item) => item !== mentor
      );
      this.mentorSelectedValues = this.mentorSelectedValues.filter(id => id !== mentor.mentorId);
    }
    // Displays the internship list based on selected course and mentor
    this.getInternshipData();
  }

  /**
   * Method is for to check mentor is selected or not.
   * @param mentor Changed mentor with details.
   * @returns ture if selected or false if not selected.
   */
  isMentorsSelected(mentor: Mentor): boolean {
    return this.mentorSelectedValues.includes(mentor.mentorId);
  }

  /**
   * Retrieves the list of batches.
   */
  getBatches() {
    this.userService.getData(`MentorDashboard/GetBatch`).subscribe((res) => {
      this.batches = res;
    });
  }

  /**
   * Sets the keyword for filtering courses and retrieves filtered courses.
   * @param keyword The keyword to filter courses.
   */
  setSearchCourse(keyword: string) {
    this.searchCourseKeyword = keyword;
    this.getCourses();
  }

  /**
   * Sets the keyword for filtering mentors and retrieves filtered mentors.
   * @param keyword The keyword to filter mentors.
   */
  setSearchMentor(keyword: string) {
    this.searchMentorKeyword = keyword;
    this.getMentors();
  }
}

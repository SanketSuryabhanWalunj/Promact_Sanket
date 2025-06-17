import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { courseList } from 'src/app/model/Course';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { batch, internshipList, mentorDetails } from 'src/app/model/internship';
import {
  filterQueryParameters,
  searchQueryParameters,
} from 'src/app/model/intern';
import { CareerPath } from 'src/app/model/career-path';

@Component({
  selector: 'app-internships',
  templateUrl: './internships.component.html',
  styleUrls: ['./internships.component.css'],
})
export class InternshipsComponent {
  internships!: internshipList[];
  pageNumbers!: number[];
  count: number;
  currentPageNo: number;
  visiblePages: number;
  totalPage: number;
  endDate!: Date;
  isAllDeleted: boolean;
  newcurerntDate!: string;
  filterForm!: FormGroup;
  filterButtonText: string = 'Filter Course';
  searchWord: any = '';
  searchFilter: string = '';
  searchQueryParameters: searchQueryParameters = {
    search: null,
    page: null,
  };
  filterQueryParameters: filterQueryParameters = {
    page: null,
    filter: null,
  };
  editInternshipForm!: FormGroup;
  selectedInternship!: internshipList;
  searchMentorKeyword!: string;
  searchedMentorList!: mentorDetails[];
  searchMentorForm!: FormGroup;
  mentorList!: mentorDetails[];
  isDateVisible: boolean = false;
  batches: batch[] = [];
  selectedBatch: string = '';
  selectedStatus: boolean | null = null;
  selectedCourse: string | null = '';
  courses: courseList[] = [];
  selectedCareerPath: CareerPath | null = null;
  careerPaths: CareerPath[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private loader: LoaderService,
    private router: Router,
    private tableLoader: LoaderTableService,
    private alert: AlertToasterService,
    private route: ActivatedRoute
  ) {
    this.isAllDeleted = false;
    this.count = 10;
    this.currentPageNo = 1;
    this.visiblePages = 3;
    this.totalPage = 0;
  }

  ngOnInit(): void {
    this.initInternForm();
    this.initEditInternshipForm();
    this.initSearchMentorForm();
    this.getBatches();
    this.getCourses();
    this.getCareerPaths();
    this.route.queryParams.subscribe((params) => {
      this.currentPageNo = +params['page'] || 1;
      const searchQuery = params['search'];
      const filterQuery = params['filter'];
      if (searchQuery) {
        this.filterForm.patchValue({
          search: searchQuery,
        });
        this.searchWord = searchQuery;
      }
      if (filterQuery) {
        this.searchFilter = filterQuery;
        this.filterButtonText = filterQuery;
      }
    });
    this.getInternshipList();
    localStorage.setItem('internshipPageNo', this.currentPageNo.toString());
    localStorage.setItem('internshipSearchQuery', this.searchWord);
    localStorage.setItem('filterQuery', this.searchFilter);
  }

  initInternForm() {
    this.filterForm = this.formBuilder.group({
      search: [''],
    });
  }

  /**
   * Method to initialize edit internship form.
   */
  initEditInternshipForm() {
    this.editInternshipForm = this.formBuilder.group({
      startDate: new FormControl(
        { value: '', disabled: false },
        Validators.required
      ),
    });
  }

  /**
   * Method to initialize search mentor form.
   */
  initSearchMentorForm() {
    this.searchMentorForm = this.formBuilder.group({
      searchMentorKeyword: [''],
    });
  }

  getInternshipList(encodedCareerPath: string = '') {
    this.isAllDeleted = false;
    this.tableLoader.showLoader();
    let statusFilter: boolean | null = null;
    if (this.selectedStatus === true || this.selectedStatus === false) {
      statusFilter = this.selectedStatus;
    }
    this.userService
      .getData(
        `Internship/GetList?currentPageNo=${this.currentPageNo}&count=${this.count}&searchWord=${this.searchWord}&filterWord=${this.searchFilter}
        &batchFilter=${this.selectedBatch}&statusFilter=${statusFilter}&courseNameFilter=${this.selectedCourse}&careerPathFilter=${encodedCareerPath}`
      )
      .subscribe(
        (res) => {
          this.totalPage = res.totalPages;
          this.updateVisiblePages();
          this.internships = res.data;
          if (this.internships.length == 0) {
            this.isAllDeleted = true;
          }
          this.tableLoader.hideLoader();
        },
        (error) => {
          this.tableLoader.hideLoader();
          this.alert.error(
            'Unable to fetch details. Please try again later...'
          );
        }
      );
  }

  /**
   * Load intern of that particular page number.
   * @param pageNumber : pagination page number.
   */
  goToPage(pageNumber: any) {
    this.tableLoader.showLoader();
    this.internships = [];
    this.currentPageNo = pageNumber;
    this.getInternshipList();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: pageNumber },
      queryParamsHandling: 'merge',
    });
    localStorage.setItem('internshipPageNo', pageNumber);
  }
  /** Update visible no of page number to navigate to any page.  */
  updateVisiblePages() {
    const halfVisible = Math.floor(this.visiblePages / 2);
    const startPage = Math.max(1, this.currentPageNo - halfVisible);
    const endPage = Math.min(this.totalPage, startPage + this.visiblePages - 1);

    this.pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }
  /**Load next page interns list. */
  next() {
    if (this.currentPageNo < this.totalPage) {
      this.currentPageNo++;
      this.updateVisiblePages();
      this.goToPage(this.currentPageNo);
    }
  }
  /**Load previous page interns list. */
  previous() {
    if (this.currentPageNo > 1) {
      this.currentPageNo--;
      this.updateVisiblePages();
      this.goToPage(this.currentPageNo);
    }
  }

  search(data: string) {
    this.tableLoader.showLoader();
    this.searchWord = data.search;
    this.currentPageNo = 1;
    this.getInternshipList();
    if (this.totalPage > 1) {
      this.searchQueryParameters['search'] = this.searchWord;
      this.searchQueryParameters['page'] = 1;
    } else {
      this.searchQueryParameters['search'] = this.searchWord;
      this.searchQueryParameters['page'] = null;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.searchQueryParameters,
      queryParamsHandling: 'merge',
    });
    localStorage.setItem('internshipSearchQuery', this.searchWord);
    localStorage.setItem('internshipPageNo', this.currentPageNo.toString());
  }

  selectFilter(data: string) {
    this.searchFilter = data;
    this.filterButtonText = data;
    this.currentPageNo = 1;
    this.getInternshipList();
    if (this.totalPage > 1) {
      this.filterQueryParameters['filter'] = this.searchFilter;
      this.filterQueryParameters['page'] = 1;
    } else {
      this.filterQueryParameters['filter'] = this.searchFilter;
      this.filterQueryParameters['page'] = null;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filterQueryParameters,
      queryParamsHandling: 'merge',
    });
    localStorage.setItem('filterQuery', this.searchFilter);
    localStorage.setItem('internshipPageNo', this.currentPageNo.toString());
  }

  setNone() {
    this.filterButtonText = 'Filter Course';
    this.searchFilter = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        filter: null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
    this.getInternshipList();
    localStorage.removeItem('filterQuery');
  }

  reset() {
    this.filterButtonText = 'Filter Course';
    this.searchFilter = '';
    this.selectedBatch = '';
    this.selectedCourse = '';
    this.selectedStatus = null;
    this.searchWord = '';
    this.selectedCareerPath = null;
    this.filterForm.reset();
    this.getInternshipList();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        search: null,
        filter: null,
      },
      queryParamsHandling: 'merge',
    });
    localStorage.removeItem('filterQuery');
    localStorage.removeItem('internshipPageNo');
    localStorage.removeItem('internshipSearchQuery');
  }

  /**
   * Method to compare current date and intership start date.
   * @returns boolean by comparing current date and start date of internhip.
   */
  isPastStartDate() {
    const start = new Date(this.selectedInternship.startDate);
    const now = new Date();
    if (now >= start) {
      this.isDateVisible = false;
    } else {
      this.isDateVisible = true;
    }
  }

  /**
   * Method to select internship to be edited.
   * @param internship Internship selected to be edited.
   */
  selectToEdit(internship: internshipList) {
    this.selectedInternship = internship;
    this.isPastStartDate();
    const date = new Date(internship.startDate);
    const formattedDate = date.toISOString().split('T')[0];
    this.editInternshipForm.patchValue({
      startDate: formattedDate,
    });
    this.mentorList = [...this.selectedInternship.mentors];
  }

  /**
   * Method to close edit form.
   */
  closeEditForm() {
    this.editInternshipForm.reset();
    this.searchMentorForm.reset();
    this.mentorList = this.selectedInternship.mentors;
    this.searchedMentorList = [];
  }

  /**
   * Method to handle checkbox change event for mentors of selected internship.
   * @param event The checkbox change event.
   * @param mentor The mentor details associated with the checkbox.
   */
  onCheckboxChange(event: Event, mentor: mentorDetails) {
    const target = event.target as HTMLInputElement;
    if (!target.checked) {
      this.mentorList = this.mentorList.filter((item) => item !== mentor);
    }
  }

  /**
   * Method to set the keyword for searching mentors and retrieves mentors accordingly.
   * @param keyword The keyword to search mentors.
   */
  setSearchMentor(keyword: string) {
    this.searchMentorKeyword = keyword;
    this.getMentors();
  }

  /**
   * Method to retrieve mentors based on the search keyword.
   */
  getMentors() {
    if (this.searchMentorKeyword) {
      this.loader.showLoader();
      this.userService
        .getMentors(`MentorDashboard/GetMentors`, {
          params: {
            KeyWord: this.searchMentorKeyword,
          },
        })
        .subscribe((res) => {
          this.searchedMentorList = res;
        });
      this.loader.hideLoader();
    } else {
      this.searchedMentorList = [];
    }
  }

  /**
   * Method to handle checkbox change event for selecting mentors from search result.
   * @param event The checkbox change event.
   * @param mentor The mentor details associated with the checkbox.
   */
  handleMentorCheckboxChange(event: Event, mentor: mentorDetails) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (!this.mentorList.map((m) => m.mentorId).includes(mentor.mentorId))
        this.mentorList.push(mentor);
    } else {
      this.mentorList = this.mentorList.filter(
        (item) => item.mentorId !== mentor.mentorId
      );
    }
  }

  /**
   * Method to check if a mentor is in mentorList and hence checks the mentors from search result.
   * @param mentorId The ID of the mentor to check.
   * @returns True if mentor is selected, false otherwise.
   */
  isSelectedMentor(mentorId: string): boolean {
    const mentorIds = this.mentorList.map((m) => m.mentorId);
    return mentorIds.includes(mentorId);
  }

  /**
   * Method to edit the internship details including assigned mentors and start date.
   */
  editInternship() {
    const data = {
      InternshipId: this.selectedInternship.id,
      StartDate: new Date(this.editInternshipForm.get('startDate')?.value),
      MentorIds: this.mentorList.map((mentor) => mentor.mentorId),
    };
    this.loader.showLoader();
    this.userService
      .changeData(`Internship/EditInternshipDetails`, data)
      .subscribe(
        (res) => {
          this.editInternshipForm.reset();
          this.searchMentorForm.reset();
          this.searchedMentorList = [];
          this.selectedInternship.mentors = this.mentorList;
          const index = this.internships.findIndex(
            (internship) => internship.id === res.id
          );
          if (index !== -1) {
            this.internships[index].mentors = res.mentors;
            this.internships[index].startDate = res.startDate;
            this.internships[index].endTime = res.endDate;
          }
          this.loader.hideLoader();
        },
        (error) => {
          this.alert.error(error);
          this.loader.hideLoader();
        }
      );
  }

  /**
   * Retrieves the list of batches.
   */
  getBatches() {
    this.userService.getData(`MentorDashboard/GetBatch`).subscribe((res) => {
      this.batches = res;
      this.sortAlphabetically();
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

  /**
   * Retrieves the list of careerPaths.
   */
  getCareerPaths() {
    this.userService.getData(`CareerPath/ListCareerPaths`).subscribe((res) => {
      this.careerPaths = res;
    });
  }

  /**
   * Sort the batches array alphabetically by batchName
   */
  sortAlphabetically() {
    this.batches.sort((a: { batchName: string }, b: { batchName: string }) => {
      return a.batchName.localeCompare(b.batchName);
    });
  }

  /**
   * Selects a batch filter and updates the selectedBatch property.
   * Additionally, it triggers the retrieval of the updated internship list based on the selected batch filter.
   * @param batchName The name of the batch to be selected as a filter.
   */
  selectBatchFilter(batchName: string) {
    this.selectedBatch = batchName;
    this.getInternshipList();
  }

  /**
   * Selects a status filter and updates the selectedStatus property.
   * Additionally, it triggers the retrieval of the updated internship list based on the selected status filter.
   * @param status The status value to be selected as a filter. It can be either true, false, or null.
   */
  selectStatusFilter(status: boolean | null): void {
    this.selectedStatus = status;
    this.getInternshipList();
  }

  /**
   * Selects a course name filter and updates the selectedCourse property.
   * Additionally, it triggers the retrieval of the updated internship list based on the selected course name filter.
   * @param courseName The course name value to be selected as a filter. It can be either a string or null.
   */
  selectCourseNameFilter(courseName: string | null): void {
    this.selectedCourse = courseName;
    this.getInternshipList();
  }

  /**
   * Selects a career path filter and updates the selectedCareerPath property.
   * Additionally, it triggers the retrieval of the updated internship list based on the selected career path filter.
   * @param careerPath The career path value to be selected as a filter. It can be either a string or null.
   */
  selectCareerPathFilter(careerPath: CareerPath): void {
    this.selectedCareerPath = careerPath;
    const encodedCareerPath = encodeURIComponent(careerPath.id || '');
    this.getInternshipList(encodedCareerPath);
  }
}

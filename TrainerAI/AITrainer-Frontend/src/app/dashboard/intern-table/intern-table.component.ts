// import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { LoaderService } from 'src/app/loader/loader.service';
import {
  adminInfo,
  assignCourse,
  courseInfo,
  courseList,
  dismissCourse,
  userList,
} from 'src/app/model/intern';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { CareerPath } from 'src/app/model/career-path';
@Component({
  selector: 'app-intern-table',
  templateUrl: './intern-table.component.html',
  styleUrls: ['./intern-table.component.css'],
})
export class InternTableComponent {
  addInternForm!: FormGroup;
  assignCourseForm!: FormGroup;
  editMode: boolean;
  showDetails!: boolean;
  selectedInternToDelete!: string;
  selectedInternToAssignCourse!: string;
  selectedValueToDismiss: string | null = null;
  users: userList[] = [];
  courseList!: courseList[];
  pageNumbers: number[] = [];
  assignedCourse!: courseInfo[];
  count: number;
  currentPageNo: number = 1;
  visiblePages: number = 3;
  totalPage: number = 0;
  id!: string;
  searchText: string = '';
  isAllDeleted: boolean;
  showDismissButton: boolean;
  createCourse: assignCourse = {
    internId: '',
    startDate: new Date(),
    courseId: '',
    batchId: '',
    mentorId: [],
    templateId: '',
  };
  dismissCourse: dismissCourse = { internId: '', courseId: '' };
  batches: any[] = [];
  AdminList: any[] = [];
  filterText: string = '';
  filterButtonText: string = 'Filter Course';
  filterForm!: FormGroup;
  searchWord: any = '';
  searchFilter: string = '';
  emailDeleted: boolean = false;
  Addbody: any;
  adminDetail!: adminInfo;
  courseAvailability: any;

  selectedMentor: any[] = [];
  isMentorSelected = false;
  templates: any;
  careerPaths: CareerPath[] = []
  selectedTemplates: string[] = [];
  minDate:string;
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private loader: LoaderService,
    private router: Router,
    private tableLoader: LoaderTableService,
    private alert: AlertToasterService,
    private route: ActivatedRoute
  ) {
    this.editMode = true;
    this.id = '';
    this.showDismissButton = false;
    this.isAllDeleted = false;
    this.count = 10;
    this.currentPageNo = 1;
    this.visiblePages = 3;
    this.totalPage = 0;
    this.minDate='';
  }
  initFilterForm() {
    this.filterForm = this.formBuilder.group({
      search: [''],
    });
  }

  setEditMode(value: boolean, name: any, id: any) {
    this.editMode = value;
    this.id = id;
    if (value) {
      this.addInternForm.get('email')?.disable();
      this.userService
        .getData(`Intern/viewIntern?internId=${id}`)
        .subscribe((res) => {
          this.addInternForm.patchValue({
            firstName: res.firstName,
            lastName: res.lastName,
            email: res.email,
            careerPathField: res.careerPath ? res.careerPath.name : null,
            batch: res.batchId
          });
        });
    } else {
      this.addInternForm.reset();
      this.addInternForm.get('email')?.enable();
    }
  }

  ngOnInit(): void {
    this.getAdmin();
    this.initInternForm();
    this.initAssignCourse();
    this.initFilterForm();
    this.setShowdetails();
    this.getBatch();
    this.getTemplateList();
    this.getCareerPaths();

    this.route.queryParams.subscribe((params) => {
      this.currentPageNo = +params['page'] || 1;
      this.getInternList();
      this.getAdminList();
    });
    localStorage.setItem('internsPageNo', this.currentPageNo.toString());
  }

  initInternForm() {
    this.addInternForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          ),
        ],
      ],
      careerPathField: [],
      batch: [null, Validators.required], 
    });
  }
  initAssignCourse() {
    this.assignCourseForm = this.formBuilder.group({
      date: ['', Validators.required],
      course: [null, Validators.required],
      template: [null, Validators.required],
    });
  }
  setShowdetails() {
    this.router.events.subscribe((event) => {
      if (
        this.router.url == '/dashboard' ||
        this.router.url == `/dashboard?page=${this.currentPageNo}`
      ) {
        this.showDetails = false;
      } else {
        this.showDetails = true;
      }
    });
  }

  /**
   * Method to get list of career paths.
   */
  getCareerPaths() {
    this.userService.getData(`CareerPath/ListCareerPaths`).subscribe({
      next: (res) => {
        this.careerPaths = res.sort((a: { name: string; }, b: { name: string; }) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error fetching career Paths:', err);
      }
    });
  }

  getAdmin() {
    this.userService.getData(`Intern/getAdminDetail`).subscribe((res) => {
      this.adminDetail = res;
    });
  }
  getIntern(userId: any) {
    this.userService
      .getData(`Intern/viewIntern?internId=${userId}`)
      .subscribe((res) => {});
  }

  getInternList() {
    this.tableLoader.showLoader();
    this.userService
      .getData(
        `Intern/viewList?currentPageNo=${this.currentPageNo}&count=${this.count}&searchWord=${this.searchWord}&filterWord=${this.searchFilter}`
      )
      .subscribe(
        (res) => {
          this.totalPage = res.totalPages;
          this.updateVisiblePages();
          this.users = res.data;

          if (this.users) {
            this.isAllDeleted = this.users.every((user) => user.isDeleted);
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
    this.users = [];
    this.currentPageNo = pageNumber;
    this.userService
      .getData(
        `Intern/viewList?currentPageNo=${pageNumber}&count=${this.count}&searchWord=${this.searchText}&filterWord=${this.filterText}`
      )
      .subscribe((res) => {
        this.users = [];
        this.users = res.data;
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
        this.tableLoader.hideLoader();
      });
    this.router.navigate([], {
      queryParams: { page: pageNumber },
      queryParamsHandling: 'merge',
    });
    localStorage.setItem('internsPageNo', pageNumber);
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

  next() {
    if (this.currentPageNo + 1 < this.totalPage) {
      this.currentPageNo++;
      this.updateVisiblePages();
      this.goToPage(this.currentPageNo);
    } else if (this.totalPage != this.currentPageNo) {
      this.currentPageNo++;
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

  /**
   * Create intern by admin
   * @param data :form values
   */

  addIntern(data: any) {
    this.loader.showLoader();
    const dataToSend = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      careerPath: data.careerPathField
    }
    this.userService
      .getData(`Intern/IsDeletd?email=${data.email}`)
      .subscribe((res) => {
        if (res == true) {
          this.loader.hideLoader();
          this.emailDeleted = true;
          this.Addbody = dataToSend;
        } else {
          if (this.addInternForm.valid) {
            const body = {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              careerPath: data.careerPathField,
              batchId: data.batch, 
            };
            this.userService.postData(`Intern/addIntern`, body).subscribe(
              (res) => {
                res.inProgressCourses = [];
                res.upcomingCourses = [];
                this.alert.success('Intern added successfully');
                this.users.unshift(res);
                if (this.users) {
                  this.isAllDeleted = this.users.every(
                    (user) => user.isDeleted
                  );
                  this.goToPage(this.currentPageNo);
                  this.updateVisiblePages();
                }
                this.loader.hideLoader();
                this.addInternForm.reset();
              },
              (error) => {
                console.error('Error adding intern', error);
                if (error.error && error.error.message) {
                  this.alert.error(error.error.message);
                  this.loader.hideLoader();
                } else {
                  this.alert.error(
                    'An error occurred while adding the intern.'
                  );
                  this.loader.hideLoader();
                }
              }
            );
          } else {
            this.alert.error('Some fields are missing');
          }
        }
      });
  }

  /**
   * Edit intern fields by admin
   */
  editDetails(data: any) {
    this.loader.showLoader();
    const careerPath = this.careerPaths.find(cp => cp.name === data.careerPathField)
    const body = {
      id: this.id,
      firstName: data.firstName,
      lastName: data.lastName,
      careerPath: careerPath?.id,
      batchId: data.batch || null, 
    };
    if (this.addInternForm.valid) {
      this.userService
        .changeData(`Intern/editIntern`, body)
        .subscribe((res) => {
          if (res) {
            this.alert.success('Intern details updated!');
            const index = this.users.findIndex((user) => user.id === res.id);
            if (index !== -1) {
              this.users[index].firstName = res.firstName;
              this.users[index].lastName = res.lastName;
              this.users[index].updatedDate = res.updatedDate;

              this.goToPage(this.currentPageNo);
              this.updateVisiblePages();
              this.addInternForm.reset();
            }
          }
        });
    } else {
      this.alert.error('Some fields are missing');
    }
    this.loader.hideLoader();
    this.editMode = true;
  }
  /**
   * get intern id to delete intern from list.
   * @param index
   */
  selectToDelete(index: number) {
    this.selectedInternToDelete = this.users[index].id;
  }
  /**
   * Get list of total number of course.
   * @param index index of userList.
   * @param intern :To find for which intern course is assigning.
   */
  selectToAssigncourse(index: number, intern: any) {
    this.courseAvailability = true;
    this.resetForm(this.assignCourseForm); //Added to rest form when initialized
    this.selectedInternToAssignCourse =
      this.users[index].firstName + ' ' + this.users[index].lastName;
    this.createCourse.internId = intern.id;
    this.minDate = new Date().toISOString().split('T')[0];
    this.userService.getData(`Course/GetCourseListIntern`).subscribe((res) => {
      this.courseList = res;
    });
  }
  /**
   * gather the list of course assigned to that intern.
   * @param index index of userList.
   */
  selectToDismissCourse(index: number) {
    this.selectedValueToDismiss = null;
    this.dismissCourse.internId = this.users[index].id;
    this.assignedCourse = [
      ...this.users[index].inProgressCourses,
      ...this.users[index].upcomingCourses,
    ];
  }
  /**
   * delete intern from internList.
   * @param id
   */
  deleteInterns(id: any) {
    this.loader.showLoader();
    this.userService
      .deleteData(`Intern/deleteIntern?Id=${id}`)
      .subscribe((res) => {
        if (res) {
          const indexToRemove = this.users.findIndex((user) => user.id === id);

          if (indexToRemove !== -1) {
            this.users.splice(indexToRemove, 1);
            this.alert.success('Intern deleted successfully');
          }
          if (this.users) {
            this.isAllDeleted = this.users.every((user) => user.isDeleted);
          }
          if (this.users.length === 0) {
            if (this.currentPageNo > 1) {
              this.currentPageNo--;
              this.goToPage(this.currentPageNo);
              this.updateVisiblePages();
            }
          } else {
            this.goToPage(this.currentPageNo);
          }
          if (this.currentPageNo == 1) {
            if (
              this.users.length <= 0 &&
              this.users.every((user) => user.isDeleted)
            ) {
              this.isAllDeleted == true;
            }
          }
        }
      });
    this.loader.hideLoader();
  }
  /**
   * Remove course assigned to intern
   * @param data contain courseId which need to removed.
   */
  removeCourse(data: any) {
    this.dismissCourse.courseId = data;

    if (this.selectedValueToDismiss) {
      this.userService
        .changeData(`Internship/dismissCourse`, this.dismissCourse)
        .subscribe((res) => {
          if (!res) {
            const userIndex = this.users.findIndex(
              (user) => user.id === this.dismissCourse.internId
            );
            const indexToRemove = this.users[
              userIndex
            ].inProgressCourses.findIndex(
              (course) => course.courseId === this.dismissCourse.courseId
            );
            if (indexToRemove !== -1) {
              this.users[userIndex].inProgressCourses.splice(indexToRemove, 1);
              this.getInternList();
            }
            const indexToRemoveInUpcoming = this.users[
              userIndex
            ].upcomingCourses.findIndex(
              (course) => course.courseId === this.dismissCourse.courseId
            );
            if (indexToRemoveInUpcoming !== -1) {
              this.users[userIndex].upcomingCourses.splice(
                indexToRemoveInUpcoming,
                1
              );
              this.getInternList();
            }
          }
        });
    } else {
      this.alert.error('Please select course');
    }
  }
  /**
   * Assign course to intern.
   * @param data : date and courseId
   */
  setCourse(data: any) {
    this.createCourse.startDate = new Date(data.date);
    this.createCourse.courseId = data.course;
    this.createCourse.mentorId = this.selectedMentor;
    this.createCourse.templateId = data.template;

    if (this.assignCourseForm.valid) {
      this.userService
        .postData(`Internship/assignCourse`, this.createCourse)
        .subscribe(
          (res) => {
            if (res) {
              const currentDateAndTime = new Date();
              //  this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')?? '';

              const userIndex = this.users.findIndex(
                (user) => user.id === this.createCourse.internId
              );
              const courseIndex = this.courseList.findIndex(
                (course) => course.id === data.course
              );

              if (userIndex !== -1) {
                // Depending on the condition, push the course info to either inProgressCourses or upcomingCourses
                const startDate = new Date(res.startDate);
                const durationInDays = this.courseList[courseIndex].duration;
                const endDate = new Date(startDate);
                if (this.courseList[courseIndex].durationType === 'Days') {
                  endDate.setDate(startDate.getDate() + durationInDays);
                } else if (
                  this.courseList[courseIndex].durationType === 'Weeks'
                ) {
                  endDate.setDate(startDate.getDate() + durationInDays * 7);
                }

                // Check if the course has expired
                if (currentDateAndTime >= endDate) {
                  // Remove the course from the respective list
                  if (this.users[userIndex].inProgressCourses) {
                    const indexToRemove = this.users[
                      userIndex
                    ].inProgressCourses.findIndex(
                      (course) =>
                        course.name !== this.courseList[courseIndex].name
                    );

                    if (indexToRemove !== -1) {
                      this.users[userIndex].inProgressCourses.splice(
                        indexToRemove,
                        1
                      );
                    }
                  }
                }
                //assign course and categories the course into Inprogress or Upcoming
                else {
                  const startDate = new Date(res.startDate);
                  if (startDate < currentDateAndTime) {
                    if (!this.users[userIndex].inProgressCourses) {
                      this.users[userIndex].inProgressCourses = [];
                    }
                    this.users[userIndex].inProgressCourses.push({
                      courseId: this.courseList[courseIndex].id,
                      name: this.courseList[courseIndex].name,
                      duration: this.courseList[courseIndex].duration,
                      durationType: this.courseList[courseIndex].durationType,
                    });
                  } else {
                    if (!this.users[userIndex].upcomingCourses) {
                      this.users[userIndex].upcomingCourses = [];
                    }
                    this.users[userIndex].upcomingCourses.push({
                      courseId: this.courseList[courseIndex].id,
                      name: this.courseList[courseIndex].name,
                      duration: this.courseList[courseIndex].duration,
                      durationType: this.courseList[courseIndex].durationType,
                    });
                  }
                }
              }
            }
          },
          (error) => {
            console.error('Error', error);
            if (error.error && error.error.message) {
              this.alert.error(error.error.message);
            }
          }
        );
    } else {
      this.alert.error('Some value are missing');
    }
    this.assignCourseForm.reset();
  }

  getBatch() {
    this.userService.getData('Batch/ListBatch').subscribe((res) => {
      this.batches = res;
    });
  }

  getAdminList() {
    this.userService.getData('Intern/GetAdminList').subscribe((res) => {
      this.AdminList = res;
    });
  }

  search(data: string) {
    if (data && data.search) {
      this.tableLoader.showLoader();
      this.searchWord = data.search;
      this.currentPageNo = 1;
      this.getInternList();
    } else {
      this.reset();
    }
  }

  selectFilter(data: string) {
    this.searchFilter = data;
    this.filterButtonText = data;
    this.getInternList();
  }

  setNone() {
    this.filterButtonText = 'Filter Course';
    this.searchFilter = '';
    this.getInternList();
  }

  reset() {
    this.filterButtonText = 'Filter Course';
    this.searchFilter = '';
    this.searchWord = '';
    this.filterForm.reset();
    this.getInternList();
  }

  getControl(name: any): AbstractControl | null {
    return this.addInternForm.get(name);
  }
  getControls(name: any): AbstractControl | null {
    return this.assignCourseForm.get(name);
  }
  resetForm(form: FormGroup) {
    form.reset();
  }
  close() {
    this.emailDeleted = false;
  }

  Update() {
    this.loader.showLoader();
    this.userService
      .changeData('Intern/enableIntern', this.Addbody)
      .subscribe((res) => {
        this.getInternList();
        this.loader.hideLoader();
        this.emailDeleted = false;
        this.loader.hideLoader();
      });
  }

  onCheckboxChange(event: any) {
    let val = event.target.checked;
    let mentor = event.target.value;

    if (val) {
      this.selectedMentor.push(mentor);
    } else {
      this.selectedMentor = this.selectedMentor.filter((m) => m !== mentor);
    }
    this.isMentorSelected = this.selectedMentor.length > 0 ? false : true;
  }

  getTemplateList() {
    this.userService.getData(`BehaviouralTemplate/get-Templates`).subscribe(
      (res) => {
        this.templates = res;
      },
      (error) => {
        this.alert.error(
          'Unable to fetch template details. Please try again later...'
        );
      }
    );
  }


  /**
 * Toggles the selection of a template based on a checkbox change event.
 * @param {Event} event - The event object triggered by the selection toggle.
 * @param {string} id - The ID of the template to toggle.
 * This method updates the selection state of a template in the form control based on the checkbox change event.
 */
  toggleSelection(event: Event, id: string) {
  const target = event.target as HTMLInputElement;
  if (target && target.type === 'checkbox') {
    const isSelected = target.checked;
    const templateControl = this.assignCourseForm.get('template');

    if (isSelected) {
      const currentTemplates = templateControl?.value || [];
      templateControl?.setValue([...currentTemplates, id]);
    } else {
      const currentTemplates = templateControl?.value || [];
      templateControl?.setValue(
        currentTemplates.filter((templateId: string) => templateId !== id)
      );
    }
  }
}


  /**
 * Method triggered when templates are selected.
 * Extracts the selected template values and updates the 'selectedTemplates' array.
 * @param {ChangeEvent<HTMLSelectElement>} event - The event object containing selected options.
 */
  onTemplateSelection(event: Event): void {
    const selectedOptions = (event.target as HTMLSelectElement)?.selectedOptions;
    this.selectedTemplates = [];
    for (let i = 0; i < selectedOptions.length; i++) {
      this.selectedTemplates.push(selectedOptions[i].value);
    }
  }
}

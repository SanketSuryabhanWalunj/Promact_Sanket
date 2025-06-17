import { Component, OnInit } from '@angular/core';
//import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
//import { Router } from '@angular/router';
import { Router } from '@angular/router'
import jwt_decode from 'jwt-decode';
import { UserService } from 'src/Services/user.service';
import { LoaderService } from '../loader/loader.service';
import { AlertToasterService } from '../alert-toaster/alert-toaster.service';
import { GetPunchRecordsDto } from '../model/punch-records';
import { StringConstant } from '../model/string-constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  updateProfileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  hidePass: boolean;
  hideNewPass: boolean;
  hideCnfNewPass: boolean;
  role: string = '';
  sidebarLinks: any = [];
  userId: string = '';
  userName: string = '';
  type!: string;
  isPunchBody!: GetPunchRecordsDto;
  isPunchlog: boolean = false;
  isPunchLogInTime!: any;
  isPunchLogOutTime!: any;

  // string Constants
  readonly Intern = StringConstant.intern;
  readonly CheckOut = StringConstant.checkOut;
  readonly CheckIn = StringConstant.checkIn;

  readonly History = StringConstant.history;
  readonly Courses = StringConstant.courses;
  readonly JournalTemplate = StringConstant.journalTemplate;
  readonly Internships = StringConstant.internships;
  readonly Organization = StringConstant.organization;
  readonly Batch = StringConstant.batch;
  readonly Scoreboard = StringConstant.scoreboard;
  readonly Attendance = StringConstant.attendance;
  readonly Leaves = StringConstant.leaves;
  readonly BehaviouralTemplate = StringConstant.behaviouralTemplate;
  readonly LeaveRequests = StringConstant.leaveRequests;
  readonly MentorDashboard = StringConstant.mentorDashboard;
  readonly FeedbackDashboard = StringConstant.feedbackDashboard;
  readonly BugsAndFeedbacks = StringConstant.bugsAndFeedbacks;
  readonly CareerPath = StringConstant.careerPath;
  readonly Holiday = StringConstant.holiday;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private loader: LoaderService,
    private alert: AlertToasterService,
  ) {
    this.hidePass = true;
    this.hideNewPass = true;
    this.hideCnfNewPass = true;
    this.type = '';
  }

  ngOnInit(): void {
    var token = localStorage.getItem("accessToken");
    if (!token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: any = jwt_decode(token);
    this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    this.userName = localStorage.getItem("userName") ?? "";
    localStorage.setItem("userId", this.userId);
    localStorage.setItem("role", this.role);
    this.setSideBarLinks();
    this.initUpdateForm();
    this.initChangePasswordForm();
    this.isPunchBody = {
      punchDate: new Date()
    }
    this.isPunch(this.isPunchBody)
  }

  // sidebar links
  setSideBarLinks() {
    this.sidebarLinks = [

      // Intern History
      {
        icon: 'fa-solid fa-clock-rotate-left',
        text: this.History,
        routerLink: '/dashboard/history',
        isVisible: this.role == 'Intern' ? true : false,
      },

      // Course for Admin
      {
        icon: 'fa-solid fa-book-open',
        text: this.Courses,
        routerLink: 'courses',
        isVisible: this.role == 'Admin' ? true : false,
      },
      {
        icon: 'fa-solid fa-people-group',
        text: this.Batch,
        routerLink: 'internbatch',
        isVisible: this.role == 'Admin' ? true : false,
      },

      // Journal For Admin
      {
        icon: 'fa-solid fa-book',
        text: this.JournalTemplate,
        routerLink: 'journal-template',
        isVisible: this.role == 'Admin' ? true : false,
      },
      {
        icon: 'fa-solid fa-tablet',
        text: this.BehaviouralTemplate,
        routerLink: 'behaviour-table-template',
        isVisible: this.role == 'Admin' ? true : false,
      },
      {
        icon: 'fa-solid fa-layer-group',
        text: this.Internships,
        routerLink: 'internships',
        isVisible: this.role == 'Admin' ? true : false,
      },
      {
        icon: 'fa-solid fas fa-landmark',
        text: this.Organization,
        routerLink: 'organization',
        isVisible: this.role == 'SuperAdmin' ? true : false,
      },
      {
        icon: 'fa-solid fa-layer-group',
        text: this.Internships,
        routerLink: 'intern-interships',
        isVisible: this.role == 'Intern' ? true : false,
      },
      {
        icon: 'fa-solid fa-chalkboard-user',
        text: this.Scoreboard,
        routerLink: 'scoreboard',
        isVisible: this.role != 'SuperAdmin' ? true : false,
      },
      {
        icon: 'fa fa-bars',
        text: this.Attendance,
        routerLink: 'punch-records-details',
        isVisible: this.role === 'Intern' ? true : false,
      },
      {
        icon: 'fa fa-bars',
        text: this.Attendance,
        routerLink: 'admin-intern-attendance-details',
        isVisible: this.role === 'Admin' ? true : false,
      },
      {
        icon: 'fas fa-sign-out-alt',
        text: this.Leaves,
        routerLink: 'intern-leave-application',
        isVisible: this.role == 'Intern' ? true : false,
      },
      {
        icon: 'fas fa-sign-out-alt',
        text: this.LeaveRequests,
        routerLink: 'leave-application',
        isVisible: this.role == 'Admin' ? true : false,
      },
      {
        icon: 'far fa-calendar-alt',
        text: this.MentorDashboard,
        routerLink: 'mentor-dashboard',
        isVisible: this.role == 'Admin' ? true : false,
      },
      {
        icon: 'fas fa-tachometer-alt',
        text: this.FeedbackDashboard,
        routerLink: 'feedback-dashboard',
        isVisible: this.role == 'Admin' ? true : false,
      },
      {
        icon: 'far fa-comments',
        text: this.BugsAndFeedbacks,
        routerLink: 'bugs-and-feedback',
        isVisible: this.role !== 'SuperAdmin' ? true : false,

      },
      {
        icon: 'fas fa-swimmer',
        text: this.CareerPath,
        routerLink: 'career-paths',
        isVisible: this.role == 'SuperAdmin' ? true : false,
      },
      {
        icon: 'fas fa-birthday-cake',
        text: this.Holiday,
        routerLink: 'admin-holiday',
        isVisible: this.role == 'SuperAdmin' ? true : false,
      },
    ]
  }

  initUpdateForm() {
    this.updateProfileForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      collegeName: ['', Validators.required],
    });
  }

  /**
   * Method is to active the router with condition because other component is not created ad a child component.
   * @param link Route link.
   * @returns boolean vaue for active or not.
   */
  isLinkActive(link: string): boolean {
    const currentPath = this.router.url.split('?')[0];
    if (link === 'internships') {
      if (currentPath.includes('/dashboard/internships')) {
        return true;
      }
      if (currentPath === '/dashboard/feedback' || currentPath === '/dashboard/behaviour-feedback' || currentPath === '/dashboard/history/details') {
        return true;
      }
    } else if (link === 'punch-records-details') {
      if (currentPath.includes('/dashboard/punch-records-details')) {
        return true;
      }
    } else if (link === 'intern-leave-application') {
      if (currentPath.includes('/dashboard/intern-leave-application')) {
        return true;
      }
    }
    return false;
  }

  fetchDetailsToUpdate() {
    this.loader.showLoader();
    this.userService.getData(`SuperAdmin/detials?Id=${this.userId}`).subscribe((res) => {
      this.type = res.type;
      this.updateProfileForm.controls['email'].disable();

      this.updateProfileForm.patchValue({
        firstname: res.firstName,
        lastname: res.lastName,
        email: res.email,
        mobile: res.contactNo,
      })
    })
    this.loader.hideLoader();
  }


  updateDetails() {
    this.loader.showLoader();
    let data = this.updateProfileForm.value;
    const body = {
      id: this.userId,
      firstName: data.firstname,
      lastName: data.lastname,
      contactNo: data.mobile,
      type: this.type
    }
    this.userService.changeData("SuperAdmin/updateDetails", body).subscribe((res) => {
      if (res) {
        this.userName = res.firstName;
        localStorage.setItem('userName', res.firstName);
        this.alert.success("Profile Updated Successfully");
      }
    })
    this.loader.hideLoader();
  }

  initChangePasswordForm() {
    this.changePasswordForm = this.formBuilder.group({
      id: '',
      oldPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&^()\[\]{}\-_=+<>|;:~`"'/\\.,])[A-Za-z\d@$!%*#?&^()\[\]{}\-_=+<>|;:~`"'/\\.,]{8,}$/),
      ],
      ],
      confirmNewPassword: ['', Validators.required]
    }, {
      validators: [this.passwordMatchValidator(), this.passwordMismatchValidator.bind(this)]
    });
  }

  togglePassword() {
    this.hidePass = !this.hidePass;
  }
  toggleNewPassword() {
    this.hideNewPass = !this.hideNewPass;
  }
  toggleCnfNewPassword() {
    this.hideCnfNewPass = !this.hideCnfNewPass;
  }

  changePassword(data: any) {
    this.loader.showLoader();
    data.id = this.userId;
    if (data.newPassword === data.oldPassword) {
      this.alert.error("Old password and new password should be different");
      this.loader.hideLoader();
      return;
    }

    if (data.newPassword == data.confirmNewPassword) {
      this.userService.changeData("User/changePassword", data).subscribe((res) => {
        if (res) {
          this.alert.success("Password Successfully Updated");
        }
        else {
          this.alert.error("Password Incorrect");
        }

        this.changePasswordForm.reset();
      },

        (error) => {
          this.alert.error(error.error.message);
        })
    }
    else {
      this.alert.warn("Confirm password is mismatched.")
    }
    this.loader.hideLoader();
  }

  logout() {
    this.loader.showLoader();
    localStorage.clear();
    this.router.navigateByUrl("/");
    this.loader.hideLoader();
  }

  passwordMatchValidator() {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const oldPassword = formGroup.get('oldPassword')?.value;
      const newPassword = formGroup.get('newPassword')?.value;

      if (oldPassword === newPassword && oldPassword && newPassword) {
        formGroup.get('newPassword')?.setErrors({ passwordMatch: true });
        return { passwordMatch: true };
      }
      return null;
    };
  }
  passwordMismatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmNewPassword = control.get('confirmNewPassword')?.value;
    if (newPassword !== confirmNewPassword) {
      control.get('confirmNewPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      control.get('confirmNewPassword')?.setErrors(null);
      return null;
    }
  }

  getControl(name: any): AbstractControl | null {
    return this.updateProfileForm.get(name);
  }
  isPunch(addbody: GetPunchRecordsDto) {
    this.userService.postData("PunchRecords/getIsPunch", addbody).subscribe((res) => {

      this.isPunchlog = res.isPunch
      this.isPunchLogInTime = res.punchLogInTime
      this.isPunchLogOutTime = res.punchLogOutTime
      if (!localStorage.getItem("internStartDate")) {
        localStorage.setItem("internStartDate", res.internStartDate);
      }

    },
      (error) => {
      });
  }
  punchIn() {
    const body = {
      InternId: "",
      PunchDate: new Date(),
      IsPunch: true,
      Comments: "",
      approvedBy: "",
      approvedDate: null
    };
    this.userService.postData("PunchRecords/punchIn", body).subscribe((res) => {
      this.isPunchBody = {
        punchDate: new Date()
      }
      this.isPunch(this.isPunchBody)
    },
      (error) => {
      });
  }
  getDate(Datevalue: any) {
    if (Datevalue != null) {
      const now = new Date(Datevalue);
      let hour = now.getHours();
      const minute = now.getMinutes();
      const second = now.getSeconds();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      hour = hour ? hour : 12;
      const formattedMinutes = minute < 10 ? '0' + minute : minute;
      const timeString = hour + ':' + formattedMinutes + ' ' + ampm;
      return `${timeString}`;
    }
    return null
  }

}

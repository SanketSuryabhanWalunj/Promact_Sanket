import { Component, Input } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import jwt_decode from 'jwt-decode';
import { LocalizedString } from '@angular/compiler';
import { LoaderTableService } from '../../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { Role } from 'src/app/model/enums';

@Component({
  selector: 'app-intern-profile',
  templateUrl: './intern-profile.component.html',
  styleUrls: ['./intern-profile.component.css'],
})
export class InternProfileComponent {
  @Input() userList: any;
  internProfile!: FormGroup;
  intern: any;
  selectedInternName: any;
  role!: Role;
  userId: string = '';
  userName: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private alert: AlertToasterService,
    private userService: UserService,
    private router: Router,
    private loader: LoaderTableService
  ) {}
  ngOnInit(): void {
    var token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: any = jwt_decode(token);
    this.role =
      decodedToken[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];
    this.userId =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];
      this.userName = localStorage.getItem("userName") ?? "";
    this.getselectedInternDetails();
    this.initProfileForm();
  }

  getselectedInternDetails() {
    this.selectedInternName = String(this.router.url.split('/')[3]);

    this.getIntern(this.selectedInternName);
  }
  initProfileForm() {
    this.internProfile = this.formBuilder.group({
      id: [''],
      firstName: [{ value: '' }, Validators.required],
      lastName: [{ value: '' }, Validators.required],
      email: [
        { value: '', disabled: this.role === Role.Intern || Role.Admin },
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          ),
        ],
      ],

      contactNo: [
        { value: '', disabled: this.role === Role.Admin },
        [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')],
      ],
      collegeName: [
        { value: '', disabled: this.role === Role.Admin },
        Validators.required,
      ],
      careerPath: [
        { value: '', disabled: this.role === Role.Intern || Role.Admin },
      ],
      createdTime: [
        { value: '', disabled: this.role === Role.Admin },
        Validators.required,
      ],
      address1: [
        { value: '', disabled: this.role === Role.Admin },
        Validators.required,
      ],
      address2: [
        { value: '', disabled: this.role === Role.Admin },
        Validators.required,
      ],
      city: [
        { value: '', disabled: this.role === Role.Admin },
        Validators.required,
      ],
      state: [
        { value: '', disabled: this.role === Role.Admin },
        Validators.required,
      ],
      zip: [
        { value: '', disabled: this.role === Role.Admin },
        Validators.required,
      ],
      
      batchId: ['']  

    });
  }
  getIntern(id: any) {
    this.loader.showLoader();
    this.userService
      .getData(`Intern/viewIntern?internId=${id}`)
      .subscribe((res) => {
        this.intern = res;
        this.internProfile.patchValue({
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          collegeName: res.collegeName,
          careerPath: res.careerPath?.name,
          contactNo: res.mobileNumber,
          createdTime: res.createdDate,
          address1: res.address1,
          address2: res.address2,
          city: res.city,
          state: res.state,
          zip: res.zip,
          batchId: res.BatchId,
        });
        this.loader.hideLoader();
      });
  }

  editDetails(data: any) {
    this.loader.showLoader();
    data.id = this.intern.id;
    data.batchId = this.intern.batchId;

    this.userService.changeData(`Intern/editIntern`, data).subscribe((res) => {
      localStorage.setItem("userName", res.firstName)
      this.loader.hideLoader();
      location.reload();
      this.alert.success('Details edited succesfully');
    });
  }

  getControl(name: any): AbstractControl | null {
    return this.internProfile.get(name);
  }

  handleBack() {
    this.router.navigate(['/dashboard'], {
      queryParams: { page: localStorage.getItem('internsPageNo') },
    });
  }
}

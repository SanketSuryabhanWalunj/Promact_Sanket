import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  role: string = '';
  hidePass: boolean=true;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private loader: LoaderService,
    private alert: AlertToasterService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    // TODO: for redirecting user to dashboard according to the role if user islogged in
    // if(this.auth.isLoggedIn()){
    //   const role = this.auth.getRole();
    //   this.auth.reditectByRole(role);
    // }
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$')])
    })
  }

  getControl(name: any): AbstractControl | null {
    return this.loginForm.get(name);
  }

  login(data: any) {
    localStorage.clear();
    this.loader.showLoader();
    this.userService.postData("User/login", data).subscribe((res) => {
      if (res) {
        localStorage.setItem("accessToken", res.token);
        localStorage.setItem("userName", res.profile.name);
        const decodedToken: any = jwt_decode(res.token[0]);
        this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (this.role == "Admin") {
          this.router.navigateByUrl("dashboard");
        } else if(this.role == "SuperAdmin") {
          this.router.navigateByUrl("dashboard/admin");
        } else {
          this.router.navigateByUrl("dashboard/home");
        }
        this.loader.hideLoader();
      }
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
       
        
        this.loader.hideLoader();
        const errorMessage = error.error.message;
        this.alert.error(errorMessage);
      }
    })
  }
  togglePassword() {
    this.hidePass = !this.hidePass;
  }
}

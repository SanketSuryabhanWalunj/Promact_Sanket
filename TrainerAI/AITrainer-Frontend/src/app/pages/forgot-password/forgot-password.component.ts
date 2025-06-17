import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderService } from 'src/app/loader/loader.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  forgotForm!: FormGroup;
  showMessage: boolean = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private loader: LoaderService,
    private alert: AlertToasterService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.forgotForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  getControl(name: any): AbstractControl | null {
    return this.forgotForm.get(name);
  }

  forgot(email: string) {
    this.loader.showLoader();
    const data = {
      email : email
    }
    this.userService.postData("User/forgot", data).subscribe((res) => {
      if(res) {
        this.showMessage = true;
        this.loader.hideLoader();
        this.alert.success("A password rest link has been sent to your email id");
      }
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        const errorMessage = error.error.message;
        this.alert.error(errorMessage);
        this.loader.hideLoader();
      }
    })
  }
}

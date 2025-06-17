import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { StringConstant } from 'src/app/model/string-constants';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  changePasswordForm!: FormGroup;
  token: string | null = '';
  Id: string | null = '';
  hidePass: boolean = false;
  confirmHidePass: boolean = false;
  readonly ResetPassword = StringConstant.resetPassword;
  readonly NewPassword= StringConstant.newPassword;
  readonly PasswordIsRequired = StringConstant.passwordIsRequired;
  readonly PasswordShouldContainAtLeastOneCapitalLetterANumberAndASpecialCharacter = StringConstant.passwordShouldContainAtLeastOneCapitalLetterANumberAndASpecialCharacter;
  readonly ConfirmPassword = StringConstant.confirmPassword;
  readonly ConfirmPasswordIsRequired = StringConstant.confirmPasswordIsRequired;
  readonly PasswordsDoNotMatch = StringConstant.passwordsDoNotMatch;


  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userservice: UserService,
    private alert: AlertToasterService,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.activatedRoute.queryParams.subscribe((type) => {
      this.Id = type['Id'] as string;
      this.token = type['token'] as string;
    })
    // this.token = this.route.snapshot.queryParamMap.get('token');
    // this.Id = this.route.snapshot.queryParamMap.get('Id');
  }

  initializeForm() {
    this.changePasswordForm = this.formBuilder.group(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(
            '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*#?&^()\\-_=+<>|;:[\\]{}~`"\'/\\\\.,])[\\w@$!%*#?&^()\\-_=+<>|;:[\\]{}~`"\'/\\\\.,]{8,}$'
          ),
        ]),
        newPassword: new FormControl('', [Validators.required]),
      },
      {
        validator: this.passwordMatchValidator
      }
    );
  }

  getControl(name: any): AbstractControl | null {
    return this.changePasswordForm.get(name);
  }

  changePassword(data: any) {
    if (data.password != data.newPassword) {
      this.initializeForm();
      this.alert.error('Current and new password could not be same..');
      return;
    }

    const body = {
      Id: this.Id,
      NewPassword: data.password,
      ResetToken: this.token,
    };

    this.userservice.changeData('User/reset', body).subscribe(
      (res) => {
        if (res) {
          this.alert.success('Password changed successfully');

          this.router.navigateByUrl('/login');
        }
      },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error.message;
          this.alert.error(errorMessage);
        }
      }
    );
  }
  togglePassword() {
    this.hidePass = !this.hidePass;
  }

  /**
    * It will hide and seek the password in the confirm password input field.
    */
  toggleConfirmPassword() {
    this.confirmHidePass = !this.confirmHidePass;
  }

  /**
    * It will check weather password and confirm password field is matches or not.
    */
  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const newPassword = formGroup.get('newPassword')?.value;
    if (password && newPassword && password !== newPassword) {
      formGroup.get('newPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }
}

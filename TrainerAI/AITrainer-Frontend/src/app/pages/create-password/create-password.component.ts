import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderTableService } from 'src/app/dashboard/loader-table/loader-table.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { StringConstant } from 'src/app/model/string-constants';
import { StringConstants } from 'src/app/shared/string-constants';

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.css']
})
export class CreatePasswordComponent {
  createPasswordForm!: FormGroup;
  token: string | null = '';
  Id: string | null = '';
  hidePass: boolean=true;
  passwordMismatch: boolean=false;
  confirmHidePass: boolean = false;
  readonly NewPassword = StringConstant.newPassword;
  readonly CreatePassword = StringConstant.createPassword;
  readonly Password = StringConstant.password;
  readonly PasswordIsRequired = StringConstant.passwordIsRequired;
  readonly PasswordShouldContainAtLeastOneCapitalLetterANumberAndASpecialCharacter = StringConstant.passwordShouldContainAtLeastOneCapitalLetterANumberAndASpecialCharacter;
  readonly ConfirmPassword = StringConstant.confirmPassword;
  readonly ConfirmPasswordIsRequired = StringConstant.confirmPasswordIsRequired;
  readonly PasswordsDoNotMatch = StringConstant.passwordsDoNotMatch;
  readonly errorWhileCreatePassword = StringConstants.password.errorWhileCreatePassword;
  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute :ActivatedRoute,
    private userservice: UserService,
    private alert: AlertToasterService,
    private loader: LoaderService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.activatedRoute.queryParams.subscribe((type) => {
      this.Id = type['Id'] as string;
      this.token = type['token'] as string;
    })
    }

  initializeForm() {
    this.createPasswordForm = this.formBuilder.group({
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*#?&^()\\-_=+<>|;:[\\]{}~`"\'/\\\\.,])[\\w@$!%*#?&^()\\-_=+<>|;:[\\]{}~`"\'/\\\\.,]{8,}$'
        ),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required
      ]),
    },
    {
      validator: this.passwordMatchValidator
    });
  }

  getControl(name: any): AbstractControl | null {
    return this.createPasswordForm.get(name);
  }

  createPassword(data: any) {
    this.loader.showLoader();
    if (data.newPassword != data.confirmPassword) {
      this.loader.hideLoader();
      this.passwordMismatch=true;
      return;
    }

    const body = {
      Id: this.Id,
      NewPassword: data.newPassword,
      ResetToken: this.token,
    };
    this.userservice.changeData('User/createPassword', body).subscribe(
      (res) => {
        if (res) {
          this.loader.hideLoader();
          this.alert.success('Your password has been successfully created.');

          this.router.navigateByUrl('/login');
        }
      },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.loader.hideLoader();
          const errorMessage = this.errorWhileCreatePassword;
          this.alert.error(errorMessage);
        }
      }
    );
  }
  togglePassword() {
    this.hidePass = !this.hidePass;
  }
  checkPasswordValidity(controlName: string): void {
    const control = this.createPasswordForm.get(controlName);
    if (control) {
      control.markAsTouched();
    }
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
    const password = formGroup.get('newPassword')?.value;
    const newPassword = formGroup.get('confirmPassword')?.value;
    if (password && newPassword && password !== newPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }
}

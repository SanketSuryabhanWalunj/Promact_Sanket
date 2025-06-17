import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';

@Component({
  selector: 'app-behavioural-template',
  templateUrl: './behavioural-template.component.html',
  styleUrls: ['./behavioural-template.component.css']
})
export class BehaviouralTemplateComponent implements AfterViewInit {
  templateBehaveForm!: FormGroup
  Id: string | null = '';
  IsEditMode: boolean = false;
  addedTopic: boolean = false;
  topicLength: any;
  saveEdit: boolean = false;
  @ViewChildren('textareaRef') textareaRefs!: QueryList<ElementRef>;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertToasterService,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.Id = this.route.snapshot.paramMap.get('id');

    if (this.Id) {
      this.getTemplate();
    }
  }

  ngAfterViewInit(): void {
    this.textareaRefs.changes.subscribe(() => {
      this.adjustTextareaHeight();
    });
    this.adjustTextareaHeight();
  }

  initializeForm() {
    this.templateBehaveForm = this.formBuilder.group({
      templateName: ['', Validators.required],
      options: this.formBuilder.array([])
    });
  }


  createOptionGroup(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      categoryName: [''],
      totalMarks: [''],
      receivedMarks: [null],


    });
  }

  getTemplate() {
    this.IsEditMode = true;
    this.userService.getData(`BehaviouralTemplate/GetById?id=${this.Id}`).subscribe((res) => {

      this.templateBehaveForm.patchValue({
        templateName: res.templateName,
      });

      const optionsFormArray = this.templateBehaveForm.get('options') as FormArray;
      optionsFormArray.clear();

      res.options.forEach((option: any) => {
        optionsFormArray.push(this.formBuilder.group({
          id: option.id,
          categoryName: option.categoryName,
          totalMarks: option.totalMarks,
          receivedMarks: null

        }));
      });
    })
  }

  get optionsArray() {
    return this.templateBehaveForm.get('options') as FormArray;
  }

  addOption() {
    this.optionsArray.push(this.createOptionGroup());
    this.addedTopic = true;

  }

  removeOption(index: number) {
    this.optionsArray.removeAt(index);
    if (this.optionsArray.length < 1) { this.addedTopic = false; }
  }

  createTemplate(formData: any) {


    if (!this.addedTopic && this.optionsArray.length < 1) {
      this.alert.error("Enter atleast one topic with a description");
    } else {
      const allFieldsValid = this.optionsArray.controls.every(control => {
        const topicName = control.get('categoryName')?.value;
        const description = control.get('totalMarks')?.value;
        return topicName && description;
      });

      if (!allFieldsValid) {
        this.alert.error("Enter all fields");
        this.saveEdit = true;
      } else {
        this.saveEdit = false;

        this.addedTopic = false;

        if (this.IsEditMode) {
          let data = {
            "id": this.Id,
            "templateName": formData.templateName,
            "options": formData.options
          }


          this.userService.changeData("BehaviouralTemplate/template-update", data).subscribe((res) => {
            this.alert.success("Template Updated Successfully");
            this.router.navigateByUrl("dashboard/behaviour-table-template");
          }, (error) => {
            if (error instanceof HttpErrorResponse) {
              const errorMessage = error.error.message;
              this.alert.error(errorMessage);
            }
          })

        } else {
          const body = {
            TemplateName: formData.templateName,
            Description: "",
            Options: formData.options
          };

          this.userService.postData("BehaviouralTemplate/behavioural-template", body).subscribe((res) => {
            if (res) {

              this.alert.success("Template Created Successfully");
              this.router.navigateByUrl("dashboard/behaviour-table-template");
            }
          }, (error) => {
            if (error instanceof HttpErrorResponse) {
              const errorMessage = error.error.message;
              this.alert.error(errorMessage);
            }
          })
        }
      }
    }

  }

  /**
   * Method to adjust height of text area
   */
  adjustTextareaHeight(): void {
    this.textareaRefs.forEach(textareaRef => {
      const textarea = textareaRef.nativeElement as HTMLTextAreaElement;
      textarea.style.overflow = 'hidden';
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  checkValue(data: any) {
    const allDescriptionsNotNull = this.optionsArray.controls.every(control => control.get('description')?.value !== null);
    const allTopicsEntered = this.optionsArray.controls.every(control => control.get('topicName')?.value !== null);
    if (data == "" || !allDescriptionsNotNull || !allTopicsEntered) {
      this.alert.error("Enter  all fields");
      this.saveEdit = true;
    }
    else {
      this.saveEdit = false;
    }
  }
}



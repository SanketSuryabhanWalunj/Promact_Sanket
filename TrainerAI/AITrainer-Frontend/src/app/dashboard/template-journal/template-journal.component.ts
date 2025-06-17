import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';

@Component({
  selector: 'app-template-journal',
  templateUrl: './template-journal.component.html',
  styleUrls: ['./template-journal.component.css']
})
export class TemplateJournalComponent implements OnInit {

  templateJournalForm!: FormGroup
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
    this.templateJournalForm = this.formBuilder.group({
      templateName: ['', Validators.required],
      options: this.formBuilder.array([])
    });
  }


  createOptionGroup(): FormGroup {
    return this.formBuilder.group({
      topicName: [''],
      notes: [''],
      description: ['', Validators.required],
    });
  }

  getTemplate() {
    this.IsEditMode = true;
    this.userService.getData(`JournalTemplate/GetList?id=${this.Id}`).subscribe((res) => {

      this.templateJournalForm.patchValue({
        templateName: res.templateName,
      });

      const optionsFormArray = this.templateJournalForm.get('options') as FormArray;
      optionsFormArray.clear();

      res.options.forEach((option: any) => {
        optionsFormArray.push(this.formBuilder.group({
          topicName: option.topicName,
          notes: option.notes,
          description: option.description,
        }));
      });
    })
  }

  get optionsArray() {
    return this.templateJournalForm.get('options') as FormArray;
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
        const topicName = control.get('topicName')?.value;
        const description = control.get('description')?.value;
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


          this.userService.changeData("JournalTemplate/update-template", data).subscribe((res) => {
            this.alert.success("Journal Updated Successfully");
            this.router.navigateByUrl("dashboard/template");
          }, (error) => {
            if (error instanceof HttpErrorResponse) {
              const errorMessage = error.error.message;
              this.alert.error(errorMessage);
            }
          })

        } else {
          this.userService.postData("JournalTemplate/created-templete", formData).subscribe((res) => {
            if (res) {
              this.alert.success("Journal Created Successfully");
              this.router.navigateByUrl("dashboard/template");
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

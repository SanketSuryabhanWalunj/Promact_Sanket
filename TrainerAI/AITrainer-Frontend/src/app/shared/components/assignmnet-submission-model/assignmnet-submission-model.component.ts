import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StringConstants } from '../../string-constants';
import { SubmitAssignmentDto } from 'src/app/model/history';
import { AssignmentDto, AssignmentFromDto } from '../../model';

@Component({
  selector: 'app-assignmnet-submission-model',
  templateUrl: './assignmnet-submission-model.component.html',
  styleUrls: ['./assignmnet-submission-model.component.css']
})
export class AssignmnetSubmissionModelComponent implements OnChanges{
  @Input()isModelOpen!:boolean;
  @Input()assignment!:AssignmentDto[];
  @Input()id!:string;
  @Input() modelId!:string;
  @Output() assignmentFromData = new EventEmitter<AssignmentFromDto>();
  assignmentForm!: FormGroup;
  constantString = StringConstants;
  isDropdownOpen = false;
  selectedText = 'Select an option';

  constructor( private formBuilder: FormBuilder){
  }
  ngOnChanges(changes: SimpleChanges): void {
      this.createAsssignentForm();
  }

  /**
 * Initializes and creates the assignment form with required fields.
 *
 * This method sets up the `assignmentForm` using Angular's `FormBuilder` service.
 * The form includes the following fields:
 * - `assignmentId`: A required field representing the ID of the assignment.
 * - `githubLink`: A required field for providing a GitHub link related to the assignment.
 *
 * The form is created with validation to ensure that both fields are filled out before submission.
 *
 * @returns {void}
 */
  createAsssignentForm():void{
    this.assignmentForm = this.formBuilder.group({
      assignmentId: ['', Validators.required],
      githubLink: ['', Validators.required],
    });
  }

    /**
 * Toggles the dropdown menu visibility.
 * This method is responsible for toggling the state of the dropdown. When invoked,
 * it switches the `isDropdownOpen` property between true and false, which controls
 * whether the dropdown is shown or hidden.
 *
 * @returns void
 */
    toggleDropdown(): void {
      this.isDropdownOpen = !this.isDropdownOpen;
    }

    /**
 * Selects an item from the dropdown.
 * This method is triggered when a user selects an item from the dropdown. It updates
 * the `selectedText` to display the selected item's title and sets the form control
 * value for `assignmentId` using the provided `id`. The dropdown is then closed.
 *
 * @param item - The selected assignment object.
 * @param id - The ID of the selected assignment.
 *
 * @returns void
 */  selectItem(item:AssignmentDto,id:string): void {
  this.selectedText = item.name;
  this.assignmentForm.get('assignmentId')?.setValue(id);
  this.isDropdownOpen = false;
}


/**
 * Truncates text to a maximum length and appends ellipsis if necessary.
 *
 * This method checks the length of the input text and truncates it if it exceeds
 * a defined maximum length. If the text is truncated, '...' is appended to the result.
 *
 * @param text - The text to be truncated.
 *
 * @returns string - The truncated text or the original text if within the limit.
 */  truncatedText(text: string): string {
  const maxLength=60;
  if (text.length > maxLength) {
    return text.substring(0,maxLength) + '...';
  }
  return text;
}


  /**
   * method to clear the selected tezt on model close
   * @returns void
   */
  closeModel():void{
    this.selectedText='';
    this.assignmentForm.reset();
  }


  /**
 * Submits the assignment form data when the form is valid.
 *
 * This method first checks if the `assignmentForm` is valid. If the form is valid, it retrieves
 * the form value, casts it as `AssignmentFromDto`, and emits the form data through the
 * `assignmentFromData` EventEmitter. It also logs the submitted form data to the console.
 *
 * @returns {void}
 */
   submit(): void {
    if (this.assignmentForm.valid) {
      const formValue: AssignmentFromDto = this.assignmentForm.value;
      this.assignmentFromData.emit(formValue);
    }
  }

}

import { Component, OnInit } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DecodedToken, FeedbackStatus, FeedbackType, FeedbackWithImageRes, imagedetails } from 'src/app/model/feedback';
import { adminInfo, role } from 'src/app/model/intern';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-bugs-and-feedbacks',
  templateUrl: './bugs-and-feedbacks.component.html',
  styleUrls: ['./bugs-and-feedbacks.component.css']
})
export class BugsAndFeedbacksComponent implements OnInit {
  token!: string | null;
  role!: role;
  addBugForm!: FormGroup;
  feedbackTypes = [FeedbackType.Feedback, FeedbackType.Bug];
  adminDetails: adminInfo[] = [];
  editAdmin:adminInfo[]=[];
  selectedAdminIds: string[] = [];
  adminsFieldTouched: boolean = false;
  attachments: File[] = [];
  selectedAdminNames: string = '';
  internFeedback!: FeedbackWithImageRes[];
  internbug: FeedbackWithImageRes | null = null;
  showFullText: boolean = false;
  selectedFeedbackToDelete!: string;
  showAllMentors: boolean=false;
  isIntern!: boolean;
  editMode!: boolean;
  selectedFeedbackToEdit!: string;
  selectedEditAdminNames:string[]=[]
  mentorList: adminInfo[] = [];
  selectedEditAdminIds: string[] = [];
  assignmentList: string[] = [];
  FeedbackStatus= FeedbackStatus;
  isResolved:boolean=false;
  changesMade: boolean=false;
  previousAssignmentList:string[] = [];
    
  

  constructor(private readonly userService: UserService,
    private formBuilder: FormBuilder,
    private loader: LoaderTableService,
    private alert: AlertToasterService
  ) {
  }

  ngOnInit(): void {
    this.getRole();
    
  }
  ngAfterViewInit(): void {
   
    if (this.internbug && this.internbug.admins) {
              this.selectedEditAdminNames = this.internbug.admins.map(admin => `${admin.firstName} ${admin.lastName}`);
    }
}
  /**
   * Initializes the bug feedback form.
   */
  initBugForm() {
    this.addBugForm = this.formBuilder.group({
      feedbackType: [null, this.isIntern ? Validators.required : null],
      title: [null, this.isIntern ? Validators.required : null],
      description: [null, this.isIntern ? Validators.required : null],
      comment: [null, !this.isIntern ? Validators.required : null]
    });
  }

  /**
   * Retrieves feedback from the intern.
   * Shows loader while fetching data and handles success and error responses.
   */
  getFeedbackIntern() {
    this.loader.showLoader();
    this.userService.getData(`BugsFeedback/getInternBugs`).subscribe((res) => {
      this.internFeedback = res;
      this.loader.hideLoader();
    },
      (error) => {
        this.loader.hideLoader();
        this.alert.error("Unable to fetch feedback details.Please try after some time");
        console.error(error);
      });
  }

  /**
   * Retrieves the role of the user from the JWT token stored in local storage.
   * If the role is 'Intern', calls methods to fetch admins and feedback data from the intern.s 
   */
  getRole() {
    this.token = localStorage.getItem("accessToken");
    if (!this.token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: DecodedToken = jwt_decode(this.token);
    const decodedRole: string = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    this.role = role[decodedRole as keyof typeof role];
    if (this.role == role.Intern) {
      this.isIntern=true;
      this.getInternAdmins();
      this.getFeedbackIntern();
    }
    else{
      this.getBugListMentor();
      this.getAllAdminOfMentor();
    }
    this.initBugForm();
  }


  /**
 * Retrieves a form control by its name from the addBugForm.
 * @param name The name of the form control to retrieve.
 * @returns The AbstractControl object representing the form control, or null if not found.
 */
  getControl(name: string): AbstractControl | null {
    return this.addBugForm.get(name);
  }

  /**
 * Clears the bug feedback form and associated data.
 * Resets the addBugForm, clears admin field touch state, selected admin IDs,
 * attachments, and resets checkbox states.
 */
  clearForm() {
    this.addBugForm.reset();
    this.adminsFieldTouched = false;
    this.selectedAdminIds = [];
    this.attachments = [];
    this.selectedAdminNames = '';
    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }

  /**
 * Submits a bug report or feedback.
 * Sends the bug report data along with attachments to the server for processing.
 * Upon success, clears the form, updates the feedback data, and displays a success message.
 * Upon failure, displays an error message.
 */
  reportBug() {
    this.loader.showLoader();
    const formData = this.addBugForm.value;
    const body = new FormData();
    body.append('Type', formData.feedbackType);
    body.append('Title', formData.title);
    body.append('Description', formData.description);
    body.append('Status', FeedbackStatus.Pending);
    this.attachments.forEach(file => {
      body.append('Files', file, file.name);
    });
    this.selectedAdminIds.forEach((id: string) => {
      body.append('ReportedToId', id);
    });

    this.userService.postData(`BugsFeedback/Create`, body).subscribe((res) => {

      this.clearForm();
      this.getFeedbackIntern();
      this.loader.hideLoader();
      this.alert.success("Your feedback has beeen added successfully");
    },
      (error: HttpErrorResponse) => {

        this.loader.hideLoader();
        this.alert.error("An error occured while adding your feedback/bug.Please try after some time.");

      }
    );
  }


  /**
 * Retrieves the list of mentors assigned to the intern.
 * Fetches mentor details from the server and updates the adminDetails property accordingly.
 * Displays an error message if there's an issue fetching mentor details.
 */
  getInternAdmins() {
    this.userService.getData(`BugsFeedback/InternMentors`).subscribe((res) => {
      this.adminDetails = res;
    },
    (error)=>{
      this.alert.error("Error fetching Mentor Details",error)
    }
  );
  }


  /**
 * Updates the list of selected admin IDs based on the checkbox state.
 * Adds or removes admin IDs from the selectedAdminIds array based on the checkbox state.
 * Sets the adminsFieldTouched flag to true to indicate that the admins field has been interacted with.
 * Updates the selectedAdminNames property to display the names of selected admins.
 * 
 * @param event - The event triggered by the checkbox state change.
 * @param adminId - The ID of the admin associated with the checkbox.
 */
  updateAdmins(event: Event, adminId: string) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedAdminIds.push(adminId);
    } else {
      const index = this.selectedAdminIds.indexOf(adminId);
      if (index !== -1) {
        this.selectedAdminIds.splice(index, 1);
      }
    }
    this.selectedAdminNames = this.getSelectedAdminNames();

  }

  
  /**
 * Removes an attachment from the attachments array at the specified index.
 * @param index - The index of the attachment to be removed from the attachments array.
 */
  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  /**
 * Opens a file input dialog for selecting image files.
 * When files are selected, they are added to the attachments array.
 */
  openFileInput() {
    const fileInput = document.createElement(imagedetails.input);
    fileInput.type = imagedetails.file;
    fileInput.accept = imagedetails.image;
    fileInput.multiple = true;
    fileInput.style.display = imagedetails.none;

    fileInput.addEventListener(imagedetails.change, (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        for (let i = 0; i < target.files.length; i++) {
          this.attachments.push(target.files[i]);
        }
      }
    });

    fileInput.click();
  }

  /**
 * Retrieves the names of the selected admins.
 * @returns A string containing the names of the selected admins separated by commas.
 */

  getSelectedAdminNames(): string {
    return this.adminDetails
      .filter(admin => this.selectedAdminIds.includes(admin.id))
      .map(admin => `${admin.firstName} ${admin.lastName}`)
      .join(', ');
  }

  /**
 * Determines whether the "Read More" button should be displayed based on the length of the provided text.
 * @param text The text to be evaluated.
 * @returns A boolean indicating whether the "Read More" button should be displayed.
 */
  shouldDisplayReadMore(text: string | undefined | null): boolean {
    return !!text && text.length > 100;
  }


  /**
 * Toggles the display of full text for a feedback item.
 * @param feedbackItem The feedback item to toggle.
 */
  toggleShowFullText(feedbackItem: FeedbackWithImageRes): void {
    feedbackItem.showFullText = !feedbackItem.showFullText;
    feedbackItem.showLessDescription = !feedbackItem.showLessDescription;

  }
  
   /**
 * Toggles the display of full text for a comment.
 * @param feedbackItem The feedback item to toggle.
 */
  toggleShowFullComments(feedbackItem: FeedbackWithImageRes) {
    feedbackItem.showFullComments = !feedbackItem.showFullComments;
  }

  /**
 * Retrieves feedback by its id.
 * @param feedbackId The unique identifier of the feedback to retrieve.
 */
  getFeedbackById(feedbackId: string) {
    this.loader.showLoader();
    this.userService.getData(`BugsFeedback/getFeedbackById?id=${feedbackId}`).subscribe((res) => {
      this.internbug = res;
      this.loader.hideLoader();
    },
    (error)=>{
      this.loader.hideLoader();
      this.alert.error("Error occured while fetching feedback. Please try after some time");
    }
  );
  }


  /**
 * Retrieves an image by its id and opens it in a new popup window.
 * @param id The unique identifier of the image to retrieve.
 */
  getImage(id: string): void {
    this.loader.showLoader();
    this.userService.getFileData(`BugsFeedback/getImage?attachmentId=${id}`, { responseType: 'blob' }).subscribe(
      (res: Blob) => {
        this.loader.hideLoader();
        const imageUrl = window.URL.createObjectURL(res);
        const popupWindow = window.open(imageUrl, '_blank', 'width=600,height=400');
        if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
          this.loader.hideLoader();
          this.alert.error("Popup blocked by the browser.'")
        }
      },
      (error) => {
        this.loader.hideLoader();
        this.alert.error("Error loading image", error)
      }
    );
  }



  /**
 * Toggles the display of all admins for a feedback item.
 * @param feedback The feedback item for which to toggle the admins display.
 */
  toggleShowAllAdmins(feedback: FeedbackWithImageRes): void {
    feedback.showAllAdmins = !feedback.showAllAdmins;
}

 /**
 * Deletes the feedback associated with the provided feedback ID.
 * @param feedbackId The ID of the feedback to be deleted.
 */
 deleteFeedback(feedbackId: string) {
  this.loader.showLoader();
  this.userService.deleteData(`BugsFeedback/deleteInternFeedback?feedbackId=${feedbackId}`).subscribe(
    (res) => {
      this.loader.hideLoader();
      this.alert.success("The feedback has been deleted successfully");
      this.getFeedbackIntern();
    },
    (error) => {
      this.loader.hideLoader();
      this.getFeedbackIntern();
      this.alert.error("Error occured while deleting feedback. Please try after some time");
    }
  );

}

/**
 * Sets the selected feedback ID to be deleted based on the index.
 * @param index The index of the feedback item in the array.
 */
selectToDelete(index: number) {
  this.selectedFeedbackToDelete = this.internFeedback[index].id;
}

/**
 * Retrieves bugs and feedback for mentors from the server.
 * Displays an error alert if an error occurs during the request.
 */
getBugListMentor(){
  this.loader.showLoader();
  this.userService.getData(`BugsFeedback/getFeedbackMentors`).subscribe(
    (res)=>{
      this.internFeedback=res;
      this.loader.hideLoader();
    },
    (error)=>{
      this.loader.hideLoader();
      this.alert.error("Error occured while fetching feedback. Please try after some time");
    } 
  );
}

/**
 * Sets Edit mode true and fills the addBugForm with values
 * @param editStatus the boolean value that sets edit value
 * @param index the index of the feedback to be edited
 */
setEditMode(editStatus: boolean, index: number) {
  if (editStatus) {
    if(!this.isIntern){
      this.addBugForm.get('comment')?.setValue(null); 
      this.addBugForm.get('comment')?.markAsUntouched();
    }
    this.selectedFeedbackToEdit = this.internFeedback[index].id;
    this.editMode = true;
    this.userService.getData(`BugsFeedback/getFeedbackById?id=${this.selectedFeedbackToEdit}`).subscribe((res) => {
      this.internbug = res;
      this.addBugForm.patchValue({
        feedbackType: this.internbug?.type,
        title: this.internbug?.title,
        description: this.internbug?.description
      });
      if (this.internbug?.admins) {
        this.editAdmin = [];
       
        this.internbug.admins.forEach(admin => {
          const adminInfo: adminInfo = {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            organization: '', 
            contactNo: '', 
            isDeleted: false,
            type: '', 
            checked: false 
          };
          this.editAdmin.push(adminInfo);
        });    
        this.editAdmin.forEach(editAdmin => {
          editAdmin.checked = true; 
        });    
        this.selectedAdminIds = this.editAdmin.filter(admin => admin.checked).map(admin => admin.id);
        this.selectedAdminNames = this.editAdmin.filter(admin => admin.checked).map(admin => admin.firstName + ' ' + admin.lastName).join(', ');
      }
    });
  }
}

/**
 * Checks if an admin is checked or not in the internbug object.
 * @param adminId The ID of the admin to be checked.
 * @returns A boolean value indicating whether the admin is checked or not.
 */
isAdminChecked(adminId: string | number): boolean {
   if (this.internbug && this.internbug.admins) {
         return this.internbug.admins.some(internbugAdmin => {
         return String(internbugAdmin.id) === String(adminId);
      });
  }
   return false;
}

/**
 * Submits a reply to a bug feedback.
 * This method sends a request to the server to add a mentor reply to a bug feedback.
 * Upon successful addition, it reloads the bug list for the mentor and displays a success message.
 * If an error occurs, it displays an error message.
 */
replyToBug(){
  this.loader.showLoader();
  const body={
    feedbackId:this.selectedFeedbackToEdit,
    comment: this.addBugForm.controls['comment']?.value,
    status:FeedbackStatus.Resolved
  }
  this.userService.changeData('BugsFeedback/addMentorReply',body).subscribe((res)=>{
    this.getBugListMentor();
    this.loader.hideLoader();
  this.alert.success("Comment marked succesfully");
  },
  (error)=>{
    this.loader.showLoader();
      this.alert.error("An error occured while adding comment. Please try later")
  });
 }

 
/**
 * Assigns or reassigns a mentor to a bug feedback.
 * This method fetches feedback details by ID, updates the selected feedback ID,
 * and initializes the admin details for editing.
 * It also updates the list of selected admin names and assignment list.
 * Finally, it ensures that all admins are unchecked if no admin is selected for editing.
 * @param index The index of the feedback in the internFeedback array.
 */
 assignReassignMentor(index: number) {
  this.previousAssignmentList = [];
  this.selectedEditAdminIds = [];
  this.selectedEditAdminNames=[];
  this.assignmentList=[]; 
  this.adminDetails.forEach(admin => {
    admin.checked = false;
  }); 
  this.selectedFeedbackToEdit = this.internFeedback[index].id;
  this.userService.getData(`BugsFeedback/getFeedbackById?id=${this.selectedFeedbackToEdit}`).subscribe((res) => {
    this.internbug = res;

    this.previousAssignmentList = this.internbug?.admins?.map(admin => admin.id) ?? [];
       
    if (this.internbug?.admins) {
      this.editAdmin = [];
  
      this.internbug.admins.forEach(admin => {
        const adminInfo: adminInfo = {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          organization: '',
          contactNo: '',
          isDeleted: false,
          type: '',
          checked: true
        };
        this.editAdmin.push(adminInfo);        
      });
   this.assignmentList = this.internbug.admins.map(admin => admin.id);
      this.selectedAdminNames = this.getSelectedAdminNames();
      this.selectedEditAdminNames = this.editAdmin.map(admin => `${admin.firstName} ${admin.lastName}`);     
    }
    if (this.editAdmin.length === 0) {
      this.internbug?.admins?.forEach(admin => {
        admin.checked = false;
      });
    }
    
  });

 
}


/**
 * Retrieves all admin details associated with the mentor asynchronously.
 * This method sends a request to the server to get all admin details associated with the mentor.
 * Upon successful retrieval, it stores the admin details in the adminDetails property.
 * If an error occurs, it displays an error message.
 */
 getAllAdminOfMentor(){
  this.userService.getData(`BugsFeedback/getAllAdminsForMentor`).subscribe(
    (res)=>{
      this.adminDetails = res;
    },
    (error)=>{
      this.alert.error("Error fetching Mentor Details",error)
    }
  );
   
 }


/**
 * Updates the list of assigned admins when their checkboxes are toggled.
 * This method is triggered when an admin checkbox is toggled.
 * It updates the assignmentList and selectedEditAdminNames arrays accordingly.
 * @param event The event triggered by the checkbox toggle.
 * @param adminId The ID of the admin associated with the checkbox.
 */
 updateAssignAdmins(event: Event, adminId: string) {
  const isChecked = (event.target as HTMLInputElement).checked;
  const selectedAdmin = this.adminDetails.find(admin => admin.id === adminId);
 
  if (selectedAdmin) {
    const adminName = `${selectedAdmin.firstName} ${selectedAdmin.lastName}`;

    if (isChecked) {
      
      if (!this.assignmentList.includes(adminId)) {
        this.assignmentList.push(adminId);
        this.selectedEditAdminNames.push(adminName);
      }
      
      if (!this.selectedEditAdminNames.includes(adminName)) {
        this.selectedEditAdminNames.push(adminName);
      }
    } else {
       this.assignmentList = this.assignmentList.filter(id => id !== adminId);
       this.selectedEditAdminNames = this.selectedEditAdminNames.filter(name => name !== adminName);
    }
   this.changesMade = !this.areArraysEqual(this.assignmentList, this.previousAssignmentList);      
  }  
}

/**
 * Reassigns mentors to a bug feedback.
 * This method sends a request to the server to reassign mentors to a bug feedback.
 * Upon successful reassignment, it reloads the bug list for the mentor, clears the assignment list,
 * and displays a success message.
 * If an error occurs, it displays an error message.
 */
reassignMentor() {
  this.loader.showLoader();
  const body={
    feedbackId:this.selectedFeedbackToEdit,
    mentorsId: this.assignmentList,
    status:this.internbug?.status
  }
  this.userService.changeData('BugsFeedback/addMentorReply',body).subscribe((res)=>{
    this.getBugListMentor();
    this.loader.hideLoader();
  this.alert.success("Mentors has been succesfully reassigned");
  this.assignmentList=[];
  },
  (error)=>{
    this.loader.showLoader();
      this.alert.error("An error occured while reassigning mentor. Please try later")
  });
 
}

/**
 * Checks if two arrays are equal in terms of their elements.
 * @param array1 The first array.
 * @param array2 The second array.
 * @returns True if the arrays are equal, false otherwise.
 */
areArraysEqual(array1: string[], array2: string[]): boolean {
  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

}



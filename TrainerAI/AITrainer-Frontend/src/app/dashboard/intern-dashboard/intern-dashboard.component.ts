import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  assignmentInfo,
  assignmentResponseDto,
  topicDetails,
  topicList,
} from 'src/app/model/intern-dashboard';
import { AssignmentDto, AssignmentFromDto } from 'src/app/shared/model';

@Component({
  selector: 'app-intern-dashboard',
  templateUrl: './intern-dashboard.component.html',
  styleUrls: ['./intern-dashboard.component.css'],
})
export class InternDashboardComponent implements OnInit {
  topicList!: topicList;
  topicName: any[] = [];
  today = new Date().toISOString().split('T')[0];

  assignments!: assignmentInfo[];
  // assignmentDetails: any[] = [];
  submitAssignment!: FormGroup;
  dropDown: boolean = false;
  journalId: any;
  todaysQuizLink: any;
  topicQuizId: any;
  hideQuizButtons: boolean = false;
  selectInternship!: FormGroup;
  courseInfo: topicDetails[] = [];
  courseName!: string;
  courseEndDate!: Date;
  globalIndex!: number;
  unPublishedAssignments!: assignmentInfo[];
  journalPublished!: boolean;
  internshipId = '';
  assignmentOptionsList!: AssignmentDto[];

  constructor(
    private userService: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    private loader: LoaderTableService,
    private alert: AlertToasterService
  ) {}
  ngOnInit(): void {
    this.getTodayTopicList(0);
    this.initSubmitForm();
    this.initCourseForm();
    //this.checkQuizSubmissionStatus(); //Modify the method by checking in QuizSubmission
  }

  initSubmitForm() {
    this.submitAssignment = this.formBuilder.group({
      assignmentId: ['', Validators.required],
      githubLink: ['', Validators.required],
    });
  }
  initCourseForm() {
    this.selectInternship = this.formBuilder.group({
      InternshipId: ['', Validators.required],
    });
  }

  checkQuizSubmissionStatus() {
    this.userService
      .getData(`Quiz/GetStatus?TopicId=${this.topicQuizId}`)
      .subscribe((res) => {
        if (res == true) {
          this.hideQuizButtons = true;
        } else {
          this.hideQuizButtons = false;
        }
      });
  }
  getTodayTopicList(index: number) {
    this.loader.showLoader();
    this.userService.getData('Interndashboard/GetInternCourse').subscribe(
      (res) => {
        if (res != null && res.length > 0) {
          this.courseInfo = res;
          this.internshipId = this.courseInfo[index].internshipId;
          this.selectInternship.patchValue({
            InternshipId: this.courseInfo[index].internshipId,
          });

          this.SelectedInternship(this.courseInfo[index].internshipId);
        }
        this.loader.hideLoader();
      },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.loader.hideLoader();
          const errorMessage = error.error.message;
          if (errorMessage != 'No active courses found') {
            this.loader.hideLoader();
            this.alert.error(errorMessage);
          }
        }
      }
    );
  }
  SelectedInternship(internshipId: string) {
    const index = this.courseInfo.findIndex(
      (course) => course.internshipId === internshipId
    );
    this.globalIndex = index;
    this.journalId = this.courseInfo[index].journalId;
    this.topicList = this.courseInfo[index].topicInfo;
    this.todaysQuizLink = this.courseInfo[index].topicInfo.topics.quizLink;
    this.topicQuizId = this.courseInfo[index].topicInfo.topics.id;
    this.courseName = this.courseInfo[index].courseName;
    this.courseEndDate = this.courseInfo[index].courseEndDate;
    this.checkQuizSubmissionStatus();
    this.topicName = this.courseInfo[index].topicInfo.topics.topicName
      .split(',')
      .map((item: any) => item.trim());
    this.assignments = this.courseInfo[index].topicInfo.assignment;
    this.unPublishedAssignments = this.assignments.filter(
      (x) => x.isPublished === false
    );
  //get optionsList
    this.assignmentOptionsList=this.unPublishedAssignments.map((item)=>{
      return {id:item.id, name:item.name}
    })
    this.getJournalEvaluationStaus(internshipId);
  }

  navigateJournals() {
    this.router.navigate([
      '/dashboard/view-journal',
      'home',
      this.topicList.topics.id,
      this.internshipId,
    ]);
  }

 /**
 * Method to submit the assignment form. *
 * @param data - The form data of type AssignmentFromDto, which includes all the required information
 *               for submitting the assignment.
 * @returns void
 */
  submitAssignmentForm(data: AssignmentFromDto):void{
    this.loader.showLoader();
    this.userService
      .getData(
        `assignments/check-assignment-submited?assignmentId=${data.assignmentId}&topicId=${this.topicList.topics.id}&internshipId=${this.internshipId}`
      )
      .subscribe((res) => {
        if (res == true) {
          this.dropDown = true;
          this.loader.hideLoader();
        } else {
          this.submitAssignment.reset();
          //update data object for submit an assignment
          const updateData ={
            assignmentId: data.assignmentId,
            githubLink: data.githubLink,
            internshipId: this.internshipId,
            topicId: this.topicList.topics.id,
          }
          this.userService
            .postData('assignments/assignment-submission', updateData)
            .subscribe(() => {
              this.getTodayTopicList(this.globalIndex);
              this.loader.hideLoader();
              this.alert.success('Assignmenrt successfully saved');
            });
        }
      });
  }

  close() {
    this.dropDown = false;
  }

  Update() {
    this.loader.showLoader();
    const data = this.submitAssignment.value;
    data.topicId = this.topicList.topics.id;
    data.internshipId = this.internshipId;

    this.userService
      .changeData('assignments/assignment-submission-update', data)
      .subscribe((res) => {
        this.dropDown = false;
        this.getTodayTopicList(this.globalIndex);
        this.loader.hideLoader();
        this.alert.success('Assignment successfully saved');
      });
  }

  // getAssignment() {
  //   this.userService.getData(`assignments/assignment-List?topicId=${this.topicList.topics.id}`).subscribe((res) => {
  //     this.assignmentDetails = res;
  //      // this.unPublishedAssignments = this.assignmentDetails.filter(x => x.isPublished === false);
  //  }
  goToQuiz() {
    window.open(this.todaysQuizLink, '_blank');
  }
  getResult() {
    this.hideQuizButtons = false;
    this.loader.showLoader();
    this.userService
      .getData(`Quiz/GetQuizResultInter?TopicId=${this.topicQuizId}`)
      .subscribe(
        (res) => {
          this.loader.hideLoader();
          this.hideQuizButtons = true;
          this.alert.success('Your quiz submission has been marked');
        },
        (error) => {
          this.loader.hideLoader();
          this.hideQuizButtons = false;
          this.alert.error(
            'You have not yet submitted the quiz. Please submit your quiz first'
          );
        }
      );
  }
  clearSubmit() {
    this.submitAssignment.reset();
  }
  getJournalEvaluationStaus(internshipId: string) {
    this.userService
      .getData(
        `Journal/Journal-status?internshipId=${internshipId}&topicId=${this.topicList.topics.id}`
      )
      .subscribe(
        (res) => {
          this.journalPublished = res.isPublished;
        },
        (error) => {
          this.alert.error(
            'Some error occured in Journal.Please try again later'
          );
        }
      );
  }
}

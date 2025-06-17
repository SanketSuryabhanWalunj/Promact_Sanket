import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { HttpErrorResponse } from '@angular/common/http';
import { internCourseDetails } from 'src/app/model/intern';
import { BehaviourTemplateDto, template } from 'src/app/model/template';

@Component({
  selector: 'app-admin-intern-history',
  templateUrl: './admin-intern-history.component.html',
  styleUrls: ['./admin-intern-history.component.css'],
})
export class AdminInternHistoryComponent implements OnInit {
  historyData: any[] = [];
  topicNames: any[] = [];
  internshipId!: string;
  behaviourTemplateId!: string;
  templateStatus: boolean = false;
  behaviouralTemplates: BehaviourTemplateDto[] = [];
  today = new Date().toISOString().split('T')[0];
  courseEndDate: any;
  isPublished: boolean;
  internCourseDetails: internCourseDetails = {
    firstName: '',
    lastName: '',
    courseId: '',
    courseName: '',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private loader: LoaderTableService,
    private router: Router
  ) {
    this.isPublished = false;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((param) => {
      this.internshipId = param['internshipId'];
      this.getInternCourseDetails(param['internshipId']);
      this.getHistory(param['internshipId']);
      this.fetchBehaviouralTemplates(param['internshipId']);
      this.checkFeedback();
    });
  }

  getHistory(id: string) {
    this.loader.showLoader();
    this.userService
      .getData(`Interndashboard/Internhistory?internshipId=${id}`)
      .subscribe(
        (res) => {
          if (res.topicInfo.statusCode == 404) {
            this.historyData = [];
          } else {
            this.courseEndDate = res.endDate;
            this.historyData = res.topicInfo;
            this.behaviourTemplateId = res.behaviourTemplateId;
            this.checkTemplateStatus(id);
          }
          this.loader.hideLoader();
        },
        (error) => {
          if (error instanceof HttpErrorResponse) {
            this.loader.hideLoader();
          }
        }
      );
  }

  openToggle(index: any) {
    this.topicNames = this.historyData[index].topic.topicName
      .split(',')
      .map((item: any) => item.trim());
  }

  checkTemplateStatus(id: any) {
    this.userService
      .getData(`JournalTemplate/GetTemplateStatus?internshipId=${id}`)
      .subscribe((res) => {
        if (res == true) {
          this.templateStatus = true;
        } else {
          this.templateStatus = false;
        }
      });
  }

  
  checkFeedback() {
    this.loader.showLoader();
    this.userService
      .getData(
        `Internship/IsBehaviourFeedbackExist?internshipId=${this.internshipId}`
      )
      .subscribe(
        (res) => {
          if (res) {
            this.isPublished = res;
            this.loader.hideLoader();
          }
        },
        (error) => {
          this.loader.hideLoader();
        }
      );
  }

  /**
   * Method to redirect user to previous page
   */
  handleBack() {
    this.router.navigate(['/dashboard/internships'], {
      queryParams: {
        page: localStorage.getItem('internshipPageNo'),
        search: localStorage.getItem('internshipSearchQuery'),
        filter: localStorage.getItem('filterQuery'),
      },
    });
  }

  /**
   *  Method to fetch intern names and course name
   * @param internshipId - Internship Id of intern
   */
  getInternCourseDetails(internshipId: string) {
    this.userService
      .getInternCourseDetails(
        `Internship/GetInternshipDetails?internshipId=${internshipId}`
      )
      .subscribe((res) => {
        this.internCourseDetails = res;
      });
  }


  /**
 * Method to fetch behavioural templates based on the provided internship ID.
 * @param {string} internshipId - The ID of the internship for which to fetch templates.
 */
  fetchBehaviouralTemplates(internshipId: string) {
    this.userService.getData(
      `BehaviouralTemplate/templateByInternship?internshipId=${internshipId}`
    ).subscribe(
      (res: BehaviourTemplateDto[]) => {

        const templateName = new Set();
        const uniqueTemplates: BehaviourTemplateDto[] = res.filter((template: BehaviourTemplateDto) => {
          if (!templateName.has(template.templateName)) {
              templateName.add(template.templateName);
              return true;
          }
          return false;
      });
        this.behaviouralTemplates = uniqueTemplates; 
        
      },
      (error) => {
        console.error('Error fetching behavioural templates:', error);
      }
    );
  }    
}

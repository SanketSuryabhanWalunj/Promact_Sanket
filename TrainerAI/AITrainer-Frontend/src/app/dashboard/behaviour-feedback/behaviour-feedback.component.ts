import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { behaviourCategoryFeedback, behaviourFeedback, categoryItem, categoryType, template, updateRequestData } from 'src/app/model/template';
import { LoaderTableService } from '../loader-table/loader-table.service';

@Component({
  selector: 'app-behaviour-feedback',
  templateUrl: './behaviour-feedback.component.html',
  styleUrls: ['./behaviour-feedback.component.css']
})
export class BehaviourFeedbackComponent {
  feedbackSubmission!: FormGroup
  internshipId!: string;
  templateId !: string;
  templateData!:template;
  categories:categoryItem[];
  behaviourFeedback !:behaviourFeedback;
  updateRequest!:updateRequestData[];
  isPublished: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private loader: LoaderTableService,
    private alert: AlertToasterService,
  ) {
    this.categories=[];
   }

  ngOnInit(): void {
    this.activatedRoute.fragment.subscribe((type) => {
      this.activatedRoute.queryParams.subscribe((type) => {
        this.internshipId = type['internshipId'] as string;
        this.templateId = type['templateId'] as string;

      })
    })
    this.GetBehaviourFeedback();
  }
  
  GetTemplate(){
    this.loader.showLoader();
    this.userService.getData(`BehaviouralTemplate/templateByInternship?internshipId=${this.internshipId}`).subscribe((res) => {
      this.templateData=res;
      
        this.categories = this.templateData.options.map((option:categoryType, i:number) => ({
          categoryId: option.id,
          receivedMarks:0,
          feedback:'' 
        }));
      this.loader.hideLoader();
      });
  }

  GetBehaviourFeedback(){
    this.loader.showLoader();
    this.categories = [];
    this.userService.getData(`Internship/GetBehaviourFeedback?templateId=${this.templateId}&internshipId=${this.internshipId}`).subscribe((res) => {
      this.behaviourFeedback = res;
      if(res.categoryWiseFeedback != null && res.categoryWiseFeedback.length > 0){
        this.behaviourFeedback.categoryWiseFeedback.forEach((option: behaviourCategoryFeedback) => {
          this.categories.push({
            receivedMarks: option.receivedMarks,
            categoryId: option.categoryId,
            feedback: option.feedback
          })
        });
        this.loader.hideLoader();
      }
      else{
        this.GetTemplate();
        this.loader.hideLoader();
      }  
    },(error) => {
      this.alert.error("No feedback found");
      this.GetTemplate();
      console.error('No feedback found', error);
      this.loader.hideLoader();
    });
  }

  /**
 * Checks if any category-wise behaviour feedback has an empty generalId.
 * @returns A boolean indicating whether any category-wise behaviour feedback has an empty generalId.
 */
  hasEmptyGeneralId(): boolean {
    if (this.behaviourFeedback && this.behaviourFeedback.categoryWiseFeedback) {
      return this.behaviourFeedback.categoryWiseFeedback.some(
        (feedback) => feedback.generalId === ''
      );
    }
    return false;
  }


  CreateFeedback(){
    this.loader.showLoader();
      const requestData = {
        templateId: this.templateId,
        internshipId: this.internshipId, 
        categories: this.categories,
      };    
    this.userService.postData(`Internship/CreateBehaviourFeedback`,requestData).subscribe((res) => {
      if(res){
        this.alert.success("Feedback successfully submitted");
        this.GetBehaviourFeedback();
        this.loader.hideLoader();
      }
      else{
        this.alert.error("Please try again")
        this.loader.hideLoader();
      }
    },(error) => {
      this.alert.error("Error submitting feedback");
      console.error('Error submitting feedback', error);
      this.loader.hideLoader();
    });
  }

  UpdateBehaviourFeedback() {
    this.loader.showLoader();
    this.updateRequest = this.categories.map((category) => {
      const behaviourCategory = this.behaviourFeedback.categoryWiseFeedback.find((feedback) => feedback.categoryId === category.categoryId);

      return {
        generalId: behaviourCategory ? behaviourCategory.generalId : '', 
        categoryId: category.categoryId,
        receivedMarks: category.receivedMarks,
        feedback: category.feedback
      };
    });
    
    const requestData = {
      templateId: this.templateId,
      internshipId: this.internshipId,
      categories: this.updateRequest,
    };
  
    this.userService.changeData(`Internship/UpdateBehaviourFeedback`, requestData).subscribe((res: behaviourFeedback) => {
      if (res) {
        this.alert.success("Feedback successfully updated");
        this.behaviourFeedback.categoryWiseFeedback = res.categoryWiseFeedback;
        this.categories = this.behaviourFeedback.categoryWiseFeedback.map((option: behaviourCategoryFeedback) => ({
          categoryId: option.categoryId,
          receivedMarks: option.receivedMarks,
          feedback: option.feedback,
          generalId: option.generalId
        }));
        this.loader.hideLoader();
      } else {
        this.alert.error("Please update again ")
        this.loader.hideLoader();
      }
    }, (error) => {
      this.alert.error("Error updating feedback");
      console.error('Error updating feedback', error);
      this.loader.hideLoader();
    });
  }
  
  
  DeleteBehaviourFeedback(){
    this.loader.showLoader();
    this.updateRequest = this.categories.map((category) => {
      const behaviourCategory = this.behaviourFeedback.categoryWiseFeedback.find((feedback) => feedback.categoryId === category.categoryId);
      return {
        generalId: behaviourCategory ? behaviourCategory.generalId : '', 
        categoryId: category.categoryId,
        receivedMarks: category.receivedMarks,
        feedback: category.feedback
      };
    });
    const requestData = {
      templateId: this.templateId,
      internshipId: this.internshipId, 
      categories: this.updateRequest,
    };    

    this.userService.changeData(`Internship/DeleteBehaviourFeedback`,requestData).subscribe((res) => {
      if(res){
        this.alert.success("Feedback successfully deleted");
        this.isPublished = false;
        this.GetBehaviourFeedback();
        this.behaviourFeedback.categoryWiseFeedback=[];
        this.loader.hideLoader();
      }
      else{
        this.alert.error("Please delete again ")
        this.loader.hideLoader();
      }
    },(error) => {
      this.alert.error("Error deleting feedback");
      console.error('Error deleting feedback', error);
      this.loader.hideLoader();
    });
  }

  PublishBehaviourFeedback(){
    this.loader.showLoader();
    this.updateRequest = this.categories.map((category) => {
      const behaviourCategory = this.behaviourFeedback.categoryWiseFeedback.find((feedback) => feedback.categoryId === category.categoryId);
      return {
        generalId: behaviourCategory ? behaviourCategory.generalId : '', 
        categoryId: category.categoryId,
        receivedMarks: category.receivedMarks,
        feedback: category.feedback
      };
    });
    const requestData = {
      templateId: this.templateId,
      internshipId: this.internshipId, 
      categories: this.updateRequest,
    };    

    this.userService.changeData(`Internship/PublishBehaviourFeedback`,requestData).subscribe((res) => {
      if(res){
        this.alert.success("Feedback successfully published");
        this.isPublished = true;
        this.loader.hideLoader();
      }
      else{
        this.alert.error("Please publish again ")
        this.loader.hideLoader();
      }
    },(error) => {
      this.alert.error("Error publishing feedback");
      console.error('Error publishing feedback', error);
      this.loader.hideLoader();
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import jwt_decode from 'jwt-decode';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';


@Component({
  selector: 'app-score-details',
  templateUrl: './score-details.component.html',
  styleUrls: ['./score-details.component.css']
})
export class ScoreDetailsComponent implements OnInit {
  internId: string | null = null;
  result: any;
  role: any;
  noHistory: boolean=false;

  constructor(private alert: AlertToasterService,private route: ActivatedRoute, private userService:UserService,private loader:LoaderTableService) {}

  ngOnInit(): void {
    var token = localStorage.getItem("accessToken");
    if (!token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: any = jwt_decode(token);
    this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      this.route.params.subscribe(params => {
      this.internId = params['id'];

      this.getScoreDetails();     
    });
  }

  getScoreDetails(){
    this.loader.showLoader();
    this.userService.getData(`Interndashboard/IntenProgress?internId=${this.internId}`).subscribe((res)=>{
      this.loader.hideLoader();
      this.result = res;
      if (this.result && this.result.assignmentDetails.length !== 0) {
        this.result.assignmentDetails.sort((a: { assignmentDate: string | number | Date; }, b: { assignmentDate: string | number | Date; }) => {
            return new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime();
        });
    }
    if (this.result && this.result.quizDetails.length !== 0) {
      this.result.quizDetails.sort((a: { quizDate: string | number | Date; }, b: { quizDate: string | number | Date; }) => {
          return new Date(b.quizDate).getTime() - new Date(a.quizDate).getTime();
      });
  }
  if (this.result && this.result.journalDetails.length !== 0) {
    this.result.journalDetails.sort((a: { journalDate: string | number | Date; }, b: { journalDate: string | number | Date; }) => {
        return new Date(b.journalDate).getTime() - new Date(a.journalDate).getTime();
    });
}
    },
    (error)=>{
      this.loader.hideLoader();
      if(error.error.message == "Not found Any history"){
        this.noHistory=true;
      }
      
    });
  }

  GetFeedbackFile(){
    this.loader.showLoader();
    this.userService.getData(`Internship/GetInternOverAllFeedback?internId=${this.internId}&type=excel`).subscribe((res)=>{
      const binaryData = atob(res.file.fileContents);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }

      const blob = new Blob([arrayBuffer], { type: res.file.contentType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.loader.hideLoader();
      this.alert.success('Feedback successfully downloaded!');
    });
  }
}
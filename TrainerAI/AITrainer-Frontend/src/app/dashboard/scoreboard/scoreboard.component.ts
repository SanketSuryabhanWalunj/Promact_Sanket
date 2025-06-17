import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/Services/user.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import jwt_decode from 'jwt-decode';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { StringConstant } from 'src/app/model/string-constants';
@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {

  batches: any[] = [];
  selectbatchform!: FormGroup
  scoreDetails: any[] = [];
  token!: string | null;
  role: any;
  internBatch: any;
  userId: any;
  internIdList!:string[];
  readonly NoDataDownload = StringConstant.noDataDownload
  constructor(
    private readonly userService: UserService,
    private formBuilder: FormBuilder,
    private loader: LoaderTableService,
    private alert: AlertToasterService
  ) {
    this.internIdList=[];
  }

  ngOnInit(): void {
    this.initSubmitForm();
    this.getBatch();
    this.getRole();
  }

  initSubmitForm() {
    this.selectbatchform = this.formBuilder.group({
      batch: [null, Validators.required],
    });
  }


  getBatch() {
    this.userService.getData("Batch/ListBatch").subscribe((res: any[]) => {
   
  
      
      this.batches = res;
  
      if (this.batches && this.batches.length > 0) {
        const storedBatch = localStorage.getItem('selectedBatch'); 
        if (storedBatch && this.batches.find(batch => batch.id === JSON.parse(storedBatch))) {
           this.selectbatchform.patchValue({
            batch: JSON.parse(storedBatch) 
          });
        } else {
            this.selectbatchform.patchValue({
            batch: this.batches[0].id 
          });
        }
        this.Select(this.selectbatchform.value);
      }
    });
  }
  
  Select(data: any) {
   
    this.loader.showLoader();
    this.userService.getData(`Interndashboard/Scoreboard?batchId=${data.batch}`).subscribe((res) => {
    this.scoreDetails = res.sort((a: any, b: any) => b.percentage - a.percentage);
    this.internIdList = this.scoreDetails.map((detail) => detail.id);
    this.loader.hideLoader();
    localStorage.setItem('selectedBatch', JSON.stringify(data.batch));
    });
  }
  
  getRole() {
    this.token = localStorage.getItem("accessToken");;
    if (!this.token) {
      console.error('JWT Token not found in local storage');
      return;
    }
    const decodedToken: any = jwt_decode(this.token);
    this.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
   
    
    if(this.role=='Intern'){
      this.loader.showLoader();
      this.userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      this.userService.getData(`Batch/InternBatch?id=${this.userId}`).subscribe((res)=>{
        this.internBatch = res.batchName;
        if(res){
        this.userService.getData(`Interndashboard/Scoreboard?batchId=${res.id}`).subscribe((res) => {       
          this.scoreDetails = res.sort((a: any, b: any) => b.percentage - a.percentage);
          this.internIdList = this.scoreDetails.map((detail) => detail.id);
          this.loader.hideLoader();
        })
      }
      },(error)=>{
        this.loader.hideLoader();
        this.internBatch = null;
      });
    }
  }

  GetOverAllFeedbackFile(){
    this.loader.showLoader();
    const interns=this.internIdList;
    this.userService.getFileData(`Internship/GetInternOverAllFeedbackForAll`, { params: {internIds: interns,type :"Excel"} }).subscribe((res) => {
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
      
    })
  }
  /**
   * To Download the overall scoreboard of all interns
   */
  GetOverAllFeedbackScoreboardFile() {
    const selectedBatch = JSON.parse(localStorage.getItem('selectedBatch') || '""');
    
    if (selectedBatch && this.scoreDetails && this.scoreDetails.length > 0) {
      const url = `Interndashboard/DownloadScoreboard?batchId=${selectedBatch}`;
      const options = { responseType: 'blob' }; 
      this.loader.showLoader();
      this.userService.getFileData(url, options).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'scoreboard.xlsx'; 
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link); 
        window.URL.revokeObjectURL(url); 
        this.loader.hideLoader();
      }, (error: any) => {
        this.loader.hideLoader();
        this.alert.error('Error downloading file:', error);

      });
    } else {
      this.loader.hideLoader();
      this.alert.error(this.NoDataDownload);
    }
  }
}




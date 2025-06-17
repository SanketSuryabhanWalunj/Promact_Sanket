import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StringConstant } from 'src/app/model/string-constants';

@Component({
  selector: 'app-intern-batch',
  templateUrl: './intern-batch.component.html',
  styleUrls: ['./intern-batch.component.css']
})
export class InternBatchComponent implements OnInit {

  isSundayChecked: boolean = false;
  batches: any[] = []
  AddBatchForm!: FormGroup;
  editMode: boolean = false;
  selectedBatchToDelete!: string;
  Id!: string;
  currentPage: number = 1;
  pageNumbers: number[] = [];
  visiblePages: number = 3;
  totalPage: number = 0;
  defualtList: number = 10;
  isAllDeleted: boolean = false;
  WeekdaysNames: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  SelectedWeekdaysNames: string[] = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedWeekdayText = 'Select a weekday';
  noWeekdaysSelected: boolean = false;
  isNameExists: boolean=false;

  
  selectWeekday(selectedDay: string) {
   
    this.selectedWeekdayText = selectedDay;
  }

  constructor(
    private userService: UserService,
    private loader: LoaderTableService,
    private alert: AlertToasterService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.getBatch();
    this.initializeForm();
    
  }

  initializeForm() {
   
    this.AddBatchForm = this.formBuilder.group({
      batchName: ['', Validators.required],
      description: ['', Validators.required],
      WeekdaysNames: this.formBuilder.array(
        this.WeekdaysNames.map(() => true),
      ),
      DailyHours: ['', Validators.required],
    });
 
  }
getweekdaysName(){
  return this.AddBatchForm.get('WeekdaysNames') as FormArray;
}
  getBatch() {
    this.loader.showLoader();
    this.userService.getData(`Batch/GetBatch?currentPage=${this.currentPage}&defualtList=${this.defualtList}`).subscribe((res) => {
      this.totalPage = res.totalPages;
      this.batches = res.batch;
      this.updateVisiblePages();
      this.loader.hideLoader();
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        this.loader.hideLoader();
        const errorMessage = error.error.message;
        this.alert.error(errorMessage);
      }
    })
  }

  addBatch(data: any) 
  {
    this.isNameExists = false;
    this.noWeekdaysSelected=false;
    const selectedWeekdays = this.getweekdaysName().controls
    .map((control, index) => (control.value ? this.WeekdaysNames[index] : null))
    .filter(Boolean);

  data.WeekdaysNames = selectedWeekdays;
    this.loader.showLoader();
    this.userService.postData("Batch/CreateBatch", data).subscribe((res) => {
    this.batches.push(res);
      this.goToPage(this.currentPage);
      this.updateVisiblePages();
      this.loader.hideLoader();
      this.alert.success("Batch Created Successfully");
      
      this.AddBatchForm.reset();

      
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        this.loader.hideLoader();
        const errorMessage = error.error.message;
        this.alert.error(errorMessage);
      }
    })
  }

  EditMode(value: boolean, id: string) {
    this.noWeekdaysSelected=false;
    this.editMode = value;
    const selectedWeekdays = this.AddBatchForm.get('WeekdaysNames') as FormArray;
    if (value) {
      this.Id = id
      this.userService.getData(`Batch/GetBatchById?id=${id}`).subscribe((res) => {
       
        this.WeekdaysNames.forEach((day, index) => {
          selectedWeekdays.at(index).setValue(res.weekdaysNames.includes(day));
        });
        this.AddBatchForm.patchValue({
          batchName: res.batchName,
          description: res.description,
          WeekdaysNames:selectedWeekdays.value,
          DailyHours:res.dailyHours
        })
    
        
      })
    } else {

      this.AddBatchForm.reset();
      this.WeekdaysNames.forEach((day, index) => {
        selectedWeekdays.at(index).setValue(this.SelectedWeekdaysNames.includes(day));  
      });
    }
  }

  editDetails(data: any) {
   
    this.loader.showLoader(); 
    data.id = this.Id
    const selectedWeekdays = this.getweekdaysName().controls
    .map((control, index) => (control.value ? this.WeekdaysNames[index] : null))
    .filter(Boolean);

  data.WeekdaysNames = selectedWeekdays;
  
    this.userService.changeData("Batch/UpdateBatch", data).subscribe((res) => {
      if (res) {
        const index = this.batches.findIndex((batch) => batch.id === res.id);
        if (index !== -1) {
          this.batches[index] = res;
        }
        this.loader.hideLoader();
        this.alert.success("Batch Details Update Successfully");
      }
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        this.loader.hideLoader();
        const errorMessage = error.error.message;
        this.alert.error(errorMessage);
      }
    })
  }

  selectToDelete(index: number) {
    this.selectedBatchToDelete = this.batches[index].id;
  }

  deleteBatch(id: string) {
    this.loader.showLoader();
    this.userService.deleteData(`Batch/DeleteBatch?id=${id}`).subscribe((res) => {
      if (res) {
        const indexToRemove = this.batches.findIndex((batch) => batch.id === id);
        if (indexToRemove !== -1) {
          this.batches.splice(indexToRemove, 1);
          this.alert.success("Batch Deleted Successfully");
        }
        if (this.batches.length === 0) {
          if (this.currentPage > 1) {
            this.currentPage--;
            this.goToPage(this.currentPage);
            this.updateVisiblePages();
          }
        } else {
          this.goToPage(this.currentPage);
        }
        if (this.currentPage == 1) {
          if (
            this.batches.length <= 0 &&
            this.batches.every((batch) => batch.isDeleted)
          ) {
            this.isAllDeleted == true;
          }
        }
        this.loader.hideLoader();
      }
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        this.loader.hideLoader();
        const errorMessage = error.error.message;
        this.alert.error(errorMessage);
      }
    })
  }

  goToPage(pageNumber: any) {
    this.batches = [];
    this.currentPage = pageNumber;
    this.userService
      .getData(
        `Batch/GetBatch?currentPage=${pageNumber}&defualtList=${this.defualtList}`
      )
      .subscribe((res) => {
        this.batches = [];
        this.batches = res.batch;
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
      });
  }

  next() {
   
    if (this.currentPage + 1 < this.totalPage) {
      this.currentPage++;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    } else if (this.totalPage != this.currentPage) {
      this.currentPage++;
      this.goToPage(this.currentPage);
      }
  }

  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    }
  }

  updateVisiblePages() {
    const halfVisible = Math.floor(this.visiblePages / 2);
    const startPage = Math.max(1, this.currentPage - halfVisible);
    const endPage = Math.min(this.totalPage, startPage + this.visiblePages - 1);

    this.pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }

  getControl(name: any): AbstractControl | null {
    return this.AddBatchForm.get(name);
  }
  validateWeekdays() {
    const selectedWeekdays = this.AddBatchForm.value.WeekdaysNames;
    this.noWeekdaysSelected = selectedWeekdays.every((weekday: boolean) => !weekday);
  }
  resetWeekdays() {
    const weekdaysFormArray = this.AddBatchForm.get('WeekdaysNames') as FormArray;
    weekdaysFormArray.controls.forEach((control, index) => {
      control.setValue(true); 
    });
  }

  checkNameExists(name: string) {
    const existingNames = this.batches.map((batch: any) => batch.batchName);
       if (existingNames.includes(name)) {
        this.isNameExists = true;
      } else {
        this.isNameExists = false;
      }
    }
    resetall() {
  this.AddBatchForm.reset();
   this.isNameExists = false;
        }
}

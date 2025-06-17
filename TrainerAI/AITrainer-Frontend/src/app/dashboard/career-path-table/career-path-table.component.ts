import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { UserService } from 'src/Services/user.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { CareerPath } from 'src/app/model/career-path';

@Component({
  selector: 'app-career-path-table',
  templateUrl: './career-path-table.component.html',
  styleUrls: ['./career-path-table.component.css'],
})
export class CareerPathTableComponent implements OnInit {
  careerPaths: CareerPath[] = [];
  careerPathForm!: FormGroup;
  editMode: boolean = false;
  careerPathExists: boolean = false;
  selectedCareerPath: CareerPath | null = null;
  pageNumbers: number[] = [];
  currentPageNo: number;
  visiblePages: number = 3;
  totalPages: number = 0;
  pageWiseCareerPaths: CareerPath[] = [];
  defaultPerPage: number = 10;
  existingPage! : string;

  constructor(
    private loader: LoaderService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private alert: AlertToasterService,
    private router: Router
  ) {
    const storedPage = localStorage.getItem('careerpathPageNo');
    this.currentPageNo = storedPage ? parseInt(storedPage, 10) : 1;
  }

  ngOnInit(): void {
    this.initCareerPathForm();
    this.getCareerPaths();
    this.existingPage = localStorage.getItem('careerpathPageNo') || '1';
  }

  /**
   * Method to initailize form
   */
  initCareerPathForm() {
    this.careerPathForm = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }

  /**
   * Mrthod ot get all career paths
   */
  getCareerPaths() {
    this.loader.showLoader();
    this.userService
      .getData('CareerPath/ListCareerPaths')
      .pipe(
        finalize(() => {
          this.loader.hideLoader();
        })
      )
      .subscribe({
        next: (res) => {
          this.careerPaths = res;
          this.updatePageWiseCareerPaths(this.existingPage);
        },
        error: () => {
          this.alert.error('Career Path not fetched');
        },
      });
  }

  /**
   * Method to update career paths on page.
   * @param page Page number on which career paths are to be updated
   */
  updatePageWiseCareerPaths(page: string) {
    const startIndex = (parseInt(page, 10) - 1) * this.defaultPerPage;
    const endIndex = startIndex + this.defaultPerPage;
    this.totalPages = Math.ceil(this.careerPaths.length / this.defaultPerPage);
    this.pageWiseCareerPaths = this.careerPaths.slice(startIndex, endIndex);
    this.updateVisiblePages();
  }

  /**
   * Method to add career path
   * @param careerPathName Career Path name to be added
   */
  addCareerPath(careerPathName: string) {
    this.loader.showLoader();
    const body = {
      CareerPathName: careerPathName,
    };
    this.userService
      .postData('CareerPath/CreateCareerPath', body)
      .pipe(
        finalize(() => {
          this.loader.hideLoader();
          this.careerPathForm.reset();
          this.goToPage(1);
          this.updatePageWiseCareerPaths("1");
        })
      )
      .subscribe({
        next: (res) => {
          this.getCareerPaths();
          localStorage.setItem('careerpathPageNo', '1')
          this.alert.success('Career Path Successfully created');
        },
        error: () => {
          this.alert.error('Career Path not added');
        },
      });
  }

  /**
   * Method to select career Path
   * @param careerPath Career Path to be selected
   */
  selectEditCareerPath(careerPath: CareerPath) {
    this.editMode = true;
    this.selectedCareerPath = careerPath;
    this.careerPathForm.patchValue({
      name: careerPath.name,
    });
  }

  /**
   * Method to select career path which is to be deleted.
   * @param careerPath Career path selected to be deleted
   */
  selectDeleteCareerPath(careerPath: CareerPath) {
    this.selectedCareerPath = careerPath;
  }

  /**
   * Method to edit career Path.
   * @param careerPathName Career Path name which is to be edited.
   */
  editCareerPath(careerPathName: string) {
    this.loader.showLoader();
    const body = {
      CareerPathId: this.selectedCareerPath?.id,
      CareerPathName: careerPathName,
    };
    this.userService
      .changeData('CareerPath/EditCareerPath', body)
      .pipe(
        finalize(() => {
          this.loader.hideLoader();
        })
      )
      .subscribe({
        next: (res) => {
          const pageIndex = this.pageWiseCareerPaths.findIndex(
            (cp) => cp.id == res.id
          );
          const index = this.careerPaths.findIndex(
            (cp) => cp.id == res.id
          );
          this.careerPaths.splice(index, 1, res);
          this.pageWiseCareerPaths.splice(pageIndex, 1, res);
          this.alert.success('Career Path Successfully edited');
        },
        error: () => {
          this.alert.error('Career Path edit failed');
        },
      });
  }

  /**
   * Method to delete selected career path.
   */
  deleteCareerPath() {
    this.loader.showLoader();
    this.userService
      .deleteData(
        `CareerPath/DeleteCareerPath?careerPathId=${this.selectedCareerPath?.id}`
      )
      .pipe(
        finalize(() => {
          this.loader.hideLoader();
        })
      )
      .subscribe({
        next: (res) => {
          const index = this.careerPaths.findIndex(
            (cp) => cp.id == res.id
          );
          const pageIndex = this.pageWiseCareerPaths.findIndex(
            (cp) => cp.id == res.id
          );
          this.getCareerPaths()
          this.updateVisiblePages();
          this.alert.success('Career Path Successfully deleted');
        },
        error: () => {
          this.alert.error('Career Path delete failed');
        },
      });
  }

  /**
   * Load intern of that particular page number.
   * @param pageNumber : pagination page number.
   */
  goToPage(pageNumber: number) {
    this.currentPageNo = pageNumber;
    this.router.navigate([], {
      queryParams: { page: pageNumber },
      queryParamsHandling: 'merge',
    });
    this.updateVisiblePages();
    this.updatePageWiseCareerPaths(pageNumber.toString());
    localStorage.setItem('careerpathPageNo', pageNumber.toString());
  }

  /** Update visible no of page number to navigate to any page.  */
  updateVisiblePages() {
    const halfVisible = Math.floor(this.visiblePages / 2);
    const startPage = Math.max(1, this.currentPageNo - halfVisible);
    const endPage = Math.min(
      this.totalPages,
      startPage + this.visiblePages - 1
    );

    this.pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }

  /**
   * Method to go on next page
   */
  next() {
    if (this.currentPageNo + 1 < this.totalPages) {
      this.currentPageNo++;
      this.updateVisiblePages();
      this.goToPage(this.currentPageNo);
    } else if (this.totalPages != this.currentPageNo) {
      this.currentPageNo++;
      this.goToPage(this.currentPageNo);
    }
  }

  /**Load previous page interns list. */
  previous() {
    if (this.currentPageNo > 1) {
      this.currentPageNo--;
      this.updateVisiblePages();
      this.goToPage(this.currentPageNo);
    }
  }

  /**
   * Method called to set various parametes when modal closes.
   */
  closeModal(){
    this.editMode = false;
    this.careerPathForm.reset();
  }
}

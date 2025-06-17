import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/Services/user.service';
import { internInternshipList } from 'src/app/model/intern-dashboard';

@Component({
  selector: 'app-intern-internship',
  templateUrl: './intern-internship.component.html',
  styleUrls: ['./intern-internship.component.css']
})
export class InternInternshipComponent {
  currentPage: number = 1;
  pageNumbers: number[] = [];
  visiblePages: number = 3;
  totalPage: number = 0;
  defualtList: number = 10;
  course!: internInternshipList[];
  courseLength!: number;
  constructor(private userService:UserService){}
  ngOnInit(): void {
    this.getIntershipDetails();
  }

  /**
 * Fetches internship details from the server and updates the course data.
 */
  getIntershipDetails(){
    this.userService.getData(`Interndashboard/GetInternInternship?currentPage=${this.currentPage}&count=${this.defualtList}`).subscribe(
      (res)=>{
        this.course = [];
        this.course=res.internships;
        this.courseLength=this.course.length;
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
      }
    );
    
  }

  /**
 * Updates the array of visible page numbers based on the current page and total pages.
 */
  updateVisiblePages() {
    const halfVisible = Math.floor(this.visiblePages / 2);
    const startPage = Math.max(1, this.currentPage - halfVisible);
    const endPage = Math.min(this.totalPage, startPage + this.visiblePages - 1);

    this.pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }
  /**
   * Navigates to a specific page of the intern internship list.
   * @param pageNumber The page number to navigate to.
   */
  goToPage(pageNumber: number) {
    this.course = [];
    this.currentPage = pageNumber;
    this.userService
      .getData(
        `Interndashboard/GetInternInternship?currentPage=${this.currentPage}&count=${this.defualtList}`
      )
      .subscribe((res) => {
        this.course = [];
        this.course = res.internships;
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
      });
  }

  /**
   * Navigates to the next page of the intern internship list if available.
   */
  next() {

    if (this.currentPage + 1 < this.totalPage) {
      this.currentPage++;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    } 
    else if (this.totalPage != this.currentPage) {
      this.currentPage++;
      this.goToPage(this.currentPage);
    }
  }

  /**
   * Navigates to the previous page of the intern internship list if available.
   */
  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    }
  }
}

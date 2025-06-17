import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../Services/user.service';
import { Router } from '@angular/router';
import { LoaderTableService } from '../loader-table/loader-table.service';
import { AlertToasterService } from 'src/app/alert-toaster/alert-toaster.service';

@Component({
  selector: 'app-template-table',
  templateUrl: './template-table.component.html',
  styleUrls: ['./template-table.component.css'],
})
export class TemplateTableComponent implements OnInit {
  lists!: any[];
  selectedTemplateToDelete: string = '';
  defualtList: number = 10;
  currentPage: number = 1;
  pageNumbers!: number[];
  visiblePages: number = 3;
  totalPage: number = 0;
  isAllDeleted: boolean = false;
  listLength: any;

  constructor(
    private userService: UserService,
    private loader: LoaderTableService,
    private router: Router,
    private tableLoader: LoaderTableService,
    private alert: AlertToasterService,
  ) {}

  ngOnInit(): void {
    this.getTemplateList();
  }

  getTemplateList() {
    this.loader.showLoader();
    this.userService
      .getData(
        `JournalTemplate/list-template?currentPage=${this.currentPage}&defualtList=${this.defualtList}`
      )
      .subscribe(
        (res) => {
          this.totalPage = res.totalPages;
          this.updateVisiblePages();
          this.lists = [];
          this.lists = res.data;
          this.listLength=this.lists.length;
          this.loader.hideLoader();
        },
        (error) => {
          this.tableLoader.hideLoader();
          this.alert.error(
            'Unable to fetch details. Please try again later...'
          );
        }
      );
  }

  deleteTemplate(id: string) {
    this.userService
      .deleteData(`JournalTemplate/delet-template?Id=${id}`)
      .subscribe((res) => {
        if (res) {
          this.alert.success("Journal Deleted Succusfully");
          const indexToRemove = this.lists.findIndex(
            (list: any) => list.id === id
          );
          if (indexToRemove !== -1) {
            this.lists.splice(indexToRemove, 1);
          }
          if (this.lists.length === 0) {
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
              this.lists.length <= 0 &&
              this.lists.every((list) => list.isDeleted)
            ) {
              this.isAllDeleted == true;
            }
          }
        }
      });
  }

  goToPage(pageNumber: any) {
    this.lists = [];
    this.currentPage = pageNumber;
    this.userService
      .getData(
        `JournalTemplate/list-template?currentPage=${pageNumber}&defualtList=${this.defualtList}`
      )
      .subscribe((res) => {
        this.lists = [];
        this.lists = res.data;
        this.totalPage = res.totalPages;
        this.updateVisiblePages();
      });
  }

  selectToDelete(index: number) {
    this.selectedTemplateToDelete = this.lists[index].id;
  }

  editDetails(id: any) {
    this.router.navigateByUrl(`dashboard/journal-template/edit/${id}`);
  }

  addtemplate() {
    this.router.navigateByUrl('dashboard/journal-template/create');
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

  next() {
    if (this.totalPage > 1) {
      if (this.currentPage + 1 < this.totalPage) {
        this.currentPage++;
        this.updateVisiblePages();
        this.goToPage(this.currentPage);
      } else if (this.totalPage != this.currentPage) {
        this.currentPage++;
        this.goToPage(this.currentPage);
       
      }
    }
  }

  previous() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
      this.goToPage(this.currentPage);
    }
  }
}

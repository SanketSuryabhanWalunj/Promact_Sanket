import { Component, OnInit } from '@angular/core';
import { holidayList } from 'src/app/model/holiday';
import { StringConstant } from 'src/app/model/string-constants';
import { UserService } from 'src/Services/user.service';

@Component({
  selector: 'app-admin-holiday-details',
  templateUrl: './admin-holiday-details.component.html',
  styleUrls: ['./admin-holiday-details.component.css']
})
export class AdminHolidayDetailsComponent implements OnInit {
  //Declare the variables
  holidayList: holidayList[] = [];

  // String Constants
  readonly nationalHolidays = StringConstant.nationalHolidays;
  readonly srNo = StringConstant.srNo;
  readonly date = StringConstant.date;
  readonly weekDays = StringConstant.weekDays;
  readonly holidays = StringConstant.holidays;
  readonly workLocation = StringConstant.workLocation;
  readonly noHolidaytoShow = StringConstant.noHolidaytoShow;

  constructor(private userService: UserService) { }
  ngOnInit(): void {
    this.getHolidayList();
  }

  /**
   * Get the national holiday list
   */
  getHolidayList(): void {
    this.userService.getData(`Holidays/getholidays`).subscribe((res) => {
      this.holidayList = res;
    }
    );
  }

}

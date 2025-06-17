import { StringConstants } from "./string-constants";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class PunchCommonMethods{
    /**
   *To check the day is halfday or not
   * @param days is number
   * @param category is string
   * @returns count of days
   */
  dayCount(days: number, category: string): number {
    if (category !== null) {
      if (category === StringConstants.secondHalf || category === StringConstants.firstHalf) {
        return 0.5;
      } else {
        return days;
      }
    }
    else {
      return days;
    }
  }
}
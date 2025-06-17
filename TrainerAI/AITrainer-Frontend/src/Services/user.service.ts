import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/Services/http.service';
import { courseList } from 'src/app/model/Course';
import { internCourseDetails } from 'src/app/model/intern';
import { Mentor } from 'src/app/model/mentor';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private punchArray: string[] = [];

  constructor(private httpService: HttpService) { }

  postData(url: string, data: any): Observable<any> {
    return this.httpService.post(url, data);
  }

  getData(url: string, params?: any): Observable<any> {
    return this.httpService.get(url, params);
  }
  getFileData(url: string, options: any) {
    return this.httpService.getFile(url, options);
  }

  changeData(url: string, data: any): Observable<any> {
    return this.httpService.put(url, data);
  }
  deleteData(url: string): Observable<any> {
    return this.httpService.delete(url);
  }

  /**
   * Service to send API request to delete submitted assignment
   * @param url api url to delete submitted assignment
   * @returns boolean to verify status of API
   */
  deleteSubmittedAssignment(url: string): Observable<boolean> {
    return this.httpService.deleteSubmittedAssignment(url);
  }

  /**
 * Service method to fetch mentor details data from the API.
 * @param url The API endpoint URL for retrieving mentor details.
 * @param options Additional options i.e. course ids' for the API request.
 * @returns An Observable<any> representing the response from the API i.e. mentor's name and id
 */
  getMentorDetailsData(url: string, options: any): Observable<any> {
    return this.httpService.getMentorDetails(url, options);
  }

  /**
   * Service to send API request to get intern name and course details
   * @param url api url to get intern and course details
   * @returns name and course details of interns
   */
  getInternCourseDetails(url: string): Observable<internCourseDetails> {
    return this.httpService.getInternCourseDetails(url);
  }

  getInternshipDetailsData(url: string, options: any): Observable<any> {
    return this.httpService.getInternshipDetails(url, options);
  }

  /**
 * Service method to fetch default courses data from the API.
 * @param url The API endpoint URL for retrieving default courses.
 * @returns An Observable<any> representing the response from the API i.e. list of all existing courses
 */
  getCourses(url: string): Observable<courseList[]> {
    return this.httpService.getCourses(url);
  }

  /**
 * Service method to fetch mentors data from the API with provided options.
 * @param url The API endpoint URL for retrieving mentors.
 * @param options Additional options for fetching mentors (if any).
 * @returns An Observable<any> representing the response from the API i.e. list of mentors
 */
  getMentors(url: string, options: any): Observable<Mentor[]> {
    return this.httpService.getMentors(url, options);
  }

  /**
   * Method is to store the intern punch request logs while he is request the single punch request
   * @param data punch record of the perticular day.
   */
  setPunchData(data: string[]) {
    this.punchArray = data;
  }

  /**
   * Method is to get the punch record that stored previously.
   * @returns List of user recod punches.
   */
  getPunchData(): string[] {
    return this.punchArray;
  }

  /**
   * Method is to clar the punch record after geting or after used.
   */
  clearPunchData() {
    this.punchArray = [];
  }

}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseUrl = environment.base_url;

  constructor(private readonly http: HttpClient) {}

  get<T>(url: string, params?: any): Observable<T> {
    let queryParams = new HttpParams();

    if (params) {
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];
          if (Array.isArray(value)) {
            for (const item of value) {
              queryParams = queryParams.append(`${key}[]`, item);
            }
          } else {
            queryParams = queryParams.set(key, value);
          }
        }
      }
    }

    return this.http.get<T>(`${this.baseUrl}/${url}`, { params: queryParams });
  }

  getFile<T>(url: string, options: any): Observable<any> {
    return this.http.get<T>(`${this.baseUrl}/${url}`, options);
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${url}`, body);
  }

  put<T>(url: string, body: T): Observable<any> {
    return this.http.put<T>(`${this.baseUrl}/${url}`, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${url}`);
  }

  /**
   * Service to send API request to delete submitted assignment
   * @param url api url to delete submitted assignment
   * @returns boolean to verify status of API
   */
  deleteSubmittedAssignment<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${url}`);
  }

  getMentorDetails<T>(url: string, options: any): Observable<any> {
    return this.http.get<T>(`${this.baseUrl}/${url}`, options);
  }

  /**
   * Service to send API request to get intern name and course details
   * @param url api url to get intern and course details
   * @returns name and course details of interns
   */
  getInternCourseDetails<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${url}`);
  }

  /**
   * Service to send API request to get internships details
   * @param url api url to get internships details
   * @returns internship details along with intername, mentorname, coursename
   */

  getInternshipDetails<T>(url:string,options:any): Observable<any>{
    return this.http.get<T>(`${this.baseUrl}/${url}`, options);
  }

  getCourses<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${url}`);
  }

  getMentors<T>(url: string, options: any): Observable<any> {
    return this.http.get<T>(`${this.baseUrl}/${url}`, options);
  }
}

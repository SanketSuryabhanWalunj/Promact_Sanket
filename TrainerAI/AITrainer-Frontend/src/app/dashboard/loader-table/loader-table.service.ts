import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderTableService {
  subTableLoader = new Subject<boolean>(); // Loader Subject

  /**
   * Method to show loader
   */
  showLoader(): void {
    this.subTableLoader.next(true);
  }

  /**
   * Method to hide loader
   */
  hideLoader(): void {
    this.subTableLoader.next(false);
  }

  /**
   * Method to Observe loader subject
   */
  getLoader(): Observable<boolean> {
    return this.subTableLoader.asObservable();
  }
}

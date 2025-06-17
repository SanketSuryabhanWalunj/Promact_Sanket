import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  subLoader = new Subject<boolean>();   // Loader Subject
  subLoaderMessage = new Subject<string>();   // Loader Subject

  /**
   * Method to show loader
   */
  showLoader(message : string = ''): void {    
    this.subLoader.next(true);
    this.subLoaderMessage.next(message);
  }

  /**
   * Method to hide loader
   */
  hideLoader(): void{
    this.subLoader.next(false);
    this.subLoaderMessage.next('');
  }

  /**
   * Method to Observe loader subject
   */
  getLoader(): Observable<boolean>{
    return this.subLoader.asObservable();
  }

  /**
   * Method to Observe loader subject
   */
  getLoaderMessage(): Observable<string>{
    return this.subLoaderMessage.asObservable();
  }
}

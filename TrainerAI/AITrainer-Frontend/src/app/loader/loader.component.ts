import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent implements OnInit, OnDestroy {

  isLoading: boolean;
  message: string;
  loaderSubscription: Subscription | undefined;
  messageSubscription: Subscription | undefined;

  constructor(private loaderService: LoaderService) {
    this.isLoading = false;
    this.message = '';
  }

  ngOnInit(): void {
    this.loaderSubscription = this.loaderService.getLoader().subscribe(data => {
      this.isLoading = data;
    });
    this.messageSubscription = this.loaderService.getLoaderMessage().subscribe(data => {
      this.message = data;
    });
  }

  ngOnDestroy(): void {
    this.loaderSubscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
  }
}

import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderTableService } from './loader-table.service';

@Component({
  selector: 'app-loader-table',
  templateUrl: './loader-table.component.html',
  styleUrls: ['./loader-table.component.css']
})
export class LoaderTableComponent {

  isVisible: boolean;
  subscription: Subscription | undefined;

  constructor(private loaderService: LoaderTableService) {
    this.isVisible = false;
  }

  ngOnInit(): void {
    this.subscription = this.loaderService.getLoader().subscribe(data => {
      this.isVisible = data;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}

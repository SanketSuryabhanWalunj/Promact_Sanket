import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryDetailsComponent } from './history-details.component';

describe('HistoryDetailsComponent', () => {
  let component: HistoryDetailsComponent;
  let fixture: ComponentFixture<HistoryDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryDetailsComponent]
    });
    fixture = TestBed.createComponent(HistoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

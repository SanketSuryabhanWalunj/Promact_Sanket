import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackDetailsComponent } from './feedback-details.component';

describe('FeedbackDetailsComponent', () => {
  let component: FeedbackDetailsComponent;
  let fixture: ComponentFixture<FeedbackDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackDetailsComponent]
    });
    fixture = TestBed.createComponent(FeedbackDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

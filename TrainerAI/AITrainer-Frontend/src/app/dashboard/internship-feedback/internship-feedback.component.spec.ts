import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipFeedbackComponent } from './internship-feedback.component';

describe('InternshipFeedbackComponent', () => {
  let component: InternshipFeedbackComponent;
  let fixture: ComponentFixture<InternshipFeedbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternshipFeedbackComponent]
    });
    fixture = TestBed.createComponent(InternshipFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

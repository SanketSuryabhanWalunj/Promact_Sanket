import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugsAndFeedbacksComponent } from './bugs-and-feedbacks.component';

describe('BugsAndFeedbacksComponent', () => {
  let component: BugsAndFeedbacksComponent;
  let fixture: ComponentFixture<BugsAndFeedbacksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BugsAndFeedbacksComponent]
    });
    fixture = TestBed.createComponent(BugsAndFeedbacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

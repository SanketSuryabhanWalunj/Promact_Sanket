import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviourFeedbackComponent } from './behaviour-feedback.component';

describe('BehaviourFeedbackComponent', () => {
  let component: BehaviourFeedbackComponent;
  let fixture: ComponentFixture<BehaviourFeedbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BehaviourFeedbackComponent]
    });
    fixture = TestBed.createComponent(BehaviourFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

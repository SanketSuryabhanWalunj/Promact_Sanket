import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmnetSubmissionModelComponent } from './assignmnet-submission-model.component';

describe('AssignmnetSubmissionModelComponent', () => {
  let component: AssignmnetSubmissionModelComponent;
  let fixture: ComponentFixture<AssignmnetSubmissionModelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignmnetSubmissionModelComponent]
    });
    fixture = TestBed.createComponent(AssignmnetSubmissionModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternLeaveApplicationComponent } from './intern-leave-application.component';

describe('InternLeaveApplicationComponent', () => {
  let component: InternLeaveApplicationComponent;
  let fixture: ComponentFixture<InternLeaveApplicationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternLeaveApplicationComponent]
    });
    fixture = TestBed.createComponent(InternLeaveApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

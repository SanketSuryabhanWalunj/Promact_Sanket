import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternAttendanceDetailsComponent } from './intern-attendance-details.component';

describe('InternAttendanceDetailsComponent', () => {
  let component: InternAttendanceDetailsComponent;
  let fixture: ComponentFixture<InternAttendanceDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternAttendanceDetailsComponent]
    });
    fixture = TestBed.createComponent(InternAttendanceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

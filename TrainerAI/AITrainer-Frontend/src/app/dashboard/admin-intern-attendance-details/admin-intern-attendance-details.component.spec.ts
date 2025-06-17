import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInternAttendanceDetailsComponent } from './admin-intern-attendance-details.component';

describe('AdminInternAttendanceDetailsComponent', () => {
  let component: AdminInternAttendanceDetailsComponent;
  let fixture: ComponentFixture<AdminInternAttendanceDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminInternAttendanceDetailsComponent]
    });
    fixture = TestBed.createComponent(AdminInternAttendanceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

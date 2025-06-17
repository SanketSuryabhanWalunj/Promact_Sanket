import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHolidayDetailsComponent } from './admin-holiday-details.component';

describe('AdminHolidayDetailsComponent', () => {
  let component: AdminHolidayDetailsComponent;
  let fixture: ComponentFixture<AdminHolidayDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminHolidayDetailsComponent]
    });
    fixture = TestBed.createComponent(AdminHolidayDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

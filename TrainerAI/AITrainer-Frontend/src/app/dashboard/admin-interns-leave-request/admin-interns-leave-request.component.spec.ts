import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInternsLeaveRequestComponent } from './admin-interns-leave-request.component';

describe('AdminInternsLeaveRequestComponent', () => {
  let component: AdminInternsLeaveRequestComponent;
  let fixture: ComponentFixture<AdminInternsLeaveRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminInternsLeaveRequestComponent]
    });
    fixture = TestBed.createComponent(AdminInternsLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

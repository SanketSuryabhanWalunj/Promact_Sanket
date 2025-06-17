import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternLeaveRequestComponent } from './intern-leave-request.component';

describe('InternLeaveRequestComponent', () => {
  let component: InternLeaveRequestComponent;
  let fixture: ComponentFixture<InternLeaveRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternLeaveRequestComponent]
    });
    fixture = TestBed.createComponent(InternLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

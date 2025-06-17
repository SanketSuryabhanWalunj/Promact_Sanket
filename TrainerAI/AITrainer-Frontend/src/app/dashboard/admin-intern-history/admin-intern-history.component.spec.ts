import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInternHistoryComponent } from './admin-intern-history.component';

describe('AdminInternHistoryComponent', () => {
  let component: AdminInternHistoryComponent;
  let fixture: ComponentFixture<AdminInternHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminInternHistoryComponent]
    });
    fixture = TestBed.createComponent(AdminInternHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

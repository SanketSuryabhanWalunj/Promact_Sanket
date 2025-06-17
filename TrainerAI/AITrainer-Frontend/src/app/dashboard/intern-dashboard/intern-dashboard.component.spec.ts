import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternDashboardComponent } from './intern-dashboard.component';

describe('InternDashboardComponent', () => {
  let component: InternDashboardComponent;
  let fixture: ComponentFixture<InternDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternDashboardComponent]
    });
    fixture = TestBed.createComponent(InternDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

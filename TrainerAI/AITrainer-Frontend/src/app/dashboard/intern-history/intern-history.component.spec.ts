import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternHistoryComponent } from './intern-history.component';

describe('InternHistoryComponent', () => {
  let component: InternHistoryComponent;
  let fixture: ComponentFixture<InternHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternHistoryComponent]
    });
    fixture = TestBed.createComponent(InternHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

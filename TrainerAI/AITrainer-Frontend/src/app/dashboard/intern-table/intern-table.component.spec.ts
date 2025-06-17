import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternTableComponent } from './intern-table.component';

describe('InternTableComponent', () => {
  let component: InternTableComponent;
  let fixture: ComponentFixture<InternTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternTableComponent]
    });
    fixture = TestBed.createComponent(InternTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

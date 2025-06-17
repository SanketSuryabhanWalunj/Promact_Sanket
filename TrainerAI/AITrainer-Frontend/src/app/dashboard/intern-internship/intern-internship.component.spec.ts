import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternInternshipComponent } from './intern-internship.component';

describe('InternInternshipComponent', () => {
  let component: InternInternshipComponent;
  let fixture: ComponentFixture<InternInternshipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternInternshipComponent]
    });
    fixture = TestBed.createComponent(InternInternshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

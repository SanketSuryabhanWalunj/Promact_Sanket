import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerPathTableComponent } from './career-path-table.component';

describe('CareerPathTableComponent', () => {
  let component: CareerPathTableComponent;
  let fixture: ComponentFixture<CareerPathTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CareerPathTableComponent]
    });
    fixture = TestBed.createComponent(CareerPathTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

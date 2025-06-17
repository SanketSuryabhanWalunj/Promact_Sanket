import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertToasterComponent } from './alert-toaster.component';

describe('AlertToasterComponent', () => {
  let component: AlertToasterComponent;
  let fixture: ComponentFixture<AlertToasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlertToasterComponent]
    });
    fixture = TestBed.createComponent(AlertToasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchRecordsDetailsComponent } from './punch-records-details.component';

describe('PunchRecordsDetailsComponent', () => {
  let component: PunchRecordsDetailsComponent;
  let fixture: ComponentFixture<PunchRecordsDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PunchRecordsDetailsComponent]
    });
    fixture = TestBed.createComponent(PunchRecordsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternBatchComponent } from './intern-batch.component';

describe('InternBatchComponent', () => {
  let component: InternBatchComponent;
  let fixture: ComponentFixture<InternBatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternBatchComponent]
    });
    fixture = TestBed.createComponent(InternBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreDetailsComponent } from './score-details.component';

describe('ScoreDetailsComponent', () => {
  let component: ScoreDetailsComponent;
  let fixture: ComponentFixture<ScoreDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScoreDetailsComponent]
    });
    fixture = TestBed.createComponent(ScoreDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

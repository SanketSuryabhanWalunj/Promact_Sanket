import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviouralTemplateTableComponent } from './behavioural-template-table.component';

describe('BehaviouralTemplateTableComponent', () => {
  let component: BehaviouralTemplateTableComponent;
  let fixture: ComponentFixture<BehaviouralTemplateTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BehaviouralTemplateTableComponent]
    });
    fixture = TestBed.createComponent(BehaviouralTemplateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

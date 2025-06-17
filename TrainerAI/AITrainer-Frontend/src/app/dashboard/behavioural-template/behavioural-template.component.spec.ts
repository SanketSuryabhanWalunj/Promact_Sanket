import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviouralTemplateComponent } from './behavioural-template.component';

describe('BehaviouralTemplateComponent', () => {
  let component: BehaviouralTemplateComponent;
  let fixture: ComponentFixture<BehaviouralTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BehaviouralTemplateComponent]
    });
    fixture = TestBed.createComponent(BehaviouralTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

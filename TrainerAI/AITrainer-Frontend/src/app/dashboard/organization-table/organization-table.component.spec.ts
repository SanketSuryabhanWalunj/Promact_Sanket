import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTableComponent } from './organization-table.component';

describe('OrganizationTableComponent', () => {
  let component: OrganizationTableComponent;
  let fixture: ComponentFixture<OrganizationTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationTableComponent]
    });
    fixture = TestBed.createComponent(OrganizationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

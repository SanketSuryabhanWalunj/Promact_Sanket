import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { components } from '.';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [...components],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  exports:[...components],
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { RouterModule, Routes } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';


import { EditComponent } from './edit/edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DeleteRequestComponent } from './components/delete-request/delete-request.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MainComponent
  },
  {
    path: 'editor/:uuid',
    component: EditComponent
  },
  {
    path: 'editor',
    component: EditComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }
]

@NgModule({
  declarations: [MainComponent, EditComponent, DeleteRequestComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormsModule,
    MatBottomSheetModule,
    FlexLayoutModule
  ],
  entryComponents: [
    DeleteRequestComponent
  ]
})
export class PlaylistModule { }

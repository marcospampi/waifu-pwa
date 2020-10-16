import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout'

// material elements
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { TimePipe } from './time.pipe';
import { DoubleClickDirective } from './directives/double-click.directive';
import { PickEpisodeComponent } from './components/pick-episode/pick-episode.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';

const routes: Routes = [
  {path: ':uuid', component: VideoPlayerComponent}
]

@NgModule({
  declarations: [VideoPlayerComponent, TimePipe, DoubleClickDirective, PickEpisodeComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    MatSliderModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBottomSheetModule,
    MatListModule,
    ScrollingModule
  ]
})
export class VideoPlayerModule { }

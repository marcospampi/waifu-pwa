import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'home', 
    loadChildren: () => import('@playlist/playlist.module').then(m => m.PlaylistModule)
  },
  {
    path: 'watch',
    loadChildren: () => import('@video-player/video-player.module').then(m => m.VideoPlayerModule)
  },
  {
    path:'**',
    redirectTo: '/home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

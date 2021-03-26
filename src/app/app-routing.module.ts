import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { routes as PlaylistModuleRoutes } from '@playlist/playlist.module';

const routes: Routes = [
  ...PlaylistModuleRoutes,
  
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

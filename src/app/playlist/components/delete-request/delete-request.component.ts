import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Playlist } from '@services/playlist/playlist-header.type';
import { RxDocument } from 'rxdb';

@Component({
  selector: 'app-delete-request',
  templateUrl: './delete-request.component.html',
  styleUrls: ['./delete-request.component.scss']
})
export class DeleteRequestComponent implements OnInit {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) 
    public data: RxDocument<Playlist>,
    private ref: MatBottomSheetRef<DeleteRequestComponent,boolean> 
  ) { 

  }

  ngOnInit(): void {
  }

  dismiss( result: boolean ) {
    this.ref.dismiss(result);
  }

}

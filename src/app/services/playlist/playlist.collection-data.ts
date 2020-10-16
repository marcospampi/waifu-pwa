import { RxCollection, RxCollectionCreator, RxDocument } from 'rxdb';
import { Playlist, PLAYLIST_HEADER_SCHEMA } from './playlist-header.type';
import { Episode, PLAYLIST_ITEM_SCHEMA } from './playlist-item.type';
import { v4 } from 'uuid';

export const COLLECTION_NAMES = {
  'playlist_headers': 'playlist_headers',
  'playlist_items': 'playlist_items'
}

export const COLLECTIONS: {[k: string]: RxCollectionCreator} = {
  [COLLECTION_NAMES.playlist_headers]: {
    name: 'playlist_headers',
    schema: PLAYLIST_HEADER_SCHEMA,
    migrationStrategies: {
      1: doc => doc
    }
    
  },
  [COLLECTION_NAMES.playlist_items]: {
    name: 'playlist_items',
    schema: PLAYLIST_ITEM_SCHEMA,
    migrationStrategies: {
      1: doc => doc
    }
  }
}

export const COLLECTIONS_HOOKS: {[k:string]: Partial<{[K in keyof RxCollection]: Function}>} = {
  [COLLECTION_NAMES.playlist_headers]: {
    preInsert: function ( data: any ) {
      const casted: Playlist = data;

      if(!data.uuid)
        data.uuid = v4();
      data.last_seen = 0;
      data.last_update = (Date.now()/1000)|0;
      data.last_seen_episode = 0;
      if ( !casted.alternative_id )
        data.alternative_id = data.uuid;
      delete data.episodes;
      
    },
    preSave: function ( data: any, doc: RxDocument) {
      if ( data.last_seen instanceof Date )
        data.last_seen = (data.last_seen.getTime() / 1000)|0;
      
      if ( data.last_update instanceof Date)
        data.last_update = (data.last_update.getTime() / 1000)|0;
      delete data.episodes;
    },
    postCreate: function( data: Episode ) {
      data.last_seen = new Date((data.last_seen as any) * 1000);
      data.last_update = new Date((data.last_update as any) * 1000);
    }

  },
  [COLLECTION_NAMES.playlist_items]: {
    preInsert: function ( data: any ) {
      data.uuid = v4();

      if( !data.title )
        data.title = (data.number + 1).toString();
      data.last_seen = 0;
      data.last_update  =( Date.now()/1000)|0;
      delete data.removed;
    },
    preSave: function( data: any, doc: RxDocument ) {
      data.last_seen = (data.last_seen.getTime()/1000)|0;
      data.last_update  = (data.last_update.getTime()/1000)|0;
      delete data.removed;
    },
    postCreate: function( data: Episode ) {
      data.last_seen = new Date((data.last_seen as any) * 1000);
      data.last_update = new Date((data.last_update as any) * 1000);
    }
  }
}
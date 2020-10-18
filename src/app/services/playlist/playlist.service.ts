import { Injectable } from '@angular/core';
import {
  addRxPlugin,
  createRxDatabase, MangoQuery, RxCollection, RxCollectionCreator, RxCollectionGenerated, RxDatabase, RxDocument, RxError, RxQuery
} from 'rxdb'
import { BehaviorSubject, concat, forkJoin, from, merge, Observable, Observer, of, scheduled, Subject, Subscription } from 'rxjs';
import { filter, map, multicast, publishBehavior, publishLast, refCount, share, switchMap, take, toArray } from 'rxjs/operators';
import { Playlist, PLAYLIST_HEADER_SCHEMA } from './playlist-header.type';
import { Episode, PLAYLIST_ITEM_SCHEMA } from './playlist-item.type';
import { COLLECTIONS, COLLECTIONS_HOOKS, COLLECTION_NAMES } from './playlist.collection-data';

@Injectable()
export class PlaylistService {
  //private _db$: BehaviorSubject<RxDatabase> = new BehaviorSubject(null);
  
  private static db$: Observable<RxDatabase> = new Observable<RxDatabase>( (obs) => {
    createRxDatabase({
      name: 'waifu_playlist',
      adapter: 'idb',
      eventReduce: true,
      multiInstance: true,
      ignoreDuplicate: true
    }).then(
      db => {
        obs.next(db);
      }
    ).catch(
      (e: RxError) => {
        obs.error(e);
      }
    ).finally(
      () => obs.complete()
    )
  }).pipe(
    share()
  );
  
  private static collections$: Observable<Map<string,RxCollection>> = new Observable<Map<string,RxCollection>>( obs => {
    const f = async () => {
      const db = await PlaylistService.db$.toPromise();
      const collections = Object.values(COLLECTIONS)
        .map(e => db.collection(e))
      
      let map = new Map<string,RxCollection>();

      for await ( let coll of collections ) {
        map.set(coll.name,coll);
        const hooks = COLLECTIONS_HOOKS[coll.name];
        for( let hook of Object.entries(hooks))
          coll[hook[0]](hook[1]);
      }

      return map;
    }

    f().then(
      colls => {
        obs.next(colls);
      }
    ).catch(
      (err: RxError) => {
        obs.error(err);
      }
    )
    .finally(
      () => obs.complete()
    )
  }).pipe(
    share()
  );

  private static keepAliveSubscriptions: Subscription[];
  protected getCollection<T = any>(collection: string): Observable<RxCollection<T>> {
    return PlaylistService.collections$.pipe(
      map( colls => colls.get(collection))
    )
  }
  constructor() {
    if( !PlaylistService.keepAliveSubscriptions)
    PlaylistService.keepAliveSubscriptions = [
      PlaylistService.db$.subscribe({error: console.error}),
      PlaylistService.collections$.subscribe({error: console.error})
    ]
    
  }

  public getPlaylists(q?: {titleLike?: string, hidden?: boolean}): Observable<Playlist[]> {

    if(!q) q = {};

    return this.getCollection(COLLECTION_NAMES.playlist_headers).pipe(
      switchMap(
        (coll: RxCollection<Playlist>) => {
          const query: MangoQuery<Playlist> = {
            selector: { 
              hidden: { $eq: 0 }
            },
            sort: [
              { 'last_seen': 'desc' , 'last_updated': 'desc'}
            ]
          };

          if ( q.titleLike ){
            query.selector.title = { 
              $regexp: new RegExp('.*'+q.titleLike.split(/\s+/).join('.*')+'.*')
            };
          }
          if ( q.hidden ) {
            delete query.selector.hidden;
          }
          return coll.find(query).$
        }
      )
    )
  }

  public saveNewPlaylist(playlist: Playlist): Observable<Playlist> {
    return this.getCollection(COLLECTION_NAMES.playlist_headers).pipe(
      switchMap(
        (collection: RxCollection<Playlist>) =>
          from(collection.insert(playlist))
      ),
      switchMap(
        complete => {
          playlist.episodes.forEach(
            (episode, idx) => {
              episode.playlist_uuid = complete.uuid;
              episode.number = idx;
            }
          );
          let next$ = this.getCollection(COLLECTION_NAMES.playlist_items).pipe(
            switchMap(
              (collection: RxCollection<Episode>) =>
                from(collection.bulkInsert(playlist.episodes))
            ),
            map( result => ({...complete._data, episodes: result.success.map(e => e._data)}))
          );
          return next$;
        }
      )
    )


  }
  public savePlaylist(playlist: Playlist<Episode & {removed: boolean}>): Observable<Playlist> {
    return this.getPlaylist(playlist.uuid).pipe(
      switchMap( document => {
        // do stuff on episodes
        
        // update number
        playlist.episodes.forEach((e,idx) => e.number = idx);

        // update existing records
        let operations_on_episodes = document.episodes.map( (episode) => {
          let find = playlist.episodes.find(e => e.uuid == episode.uuid)
          if( find ) {
            if( find.removed )
              return episode.remove();
            else {
              return episode.update({
                $set: {
                  title : find.title,
                  url : find.url,
                  last_update: new Date,
                  number: find.number
                }
              })
            }

          }
        });
        
        let operation_on_playlist = document.update({
          $set: {
            title: playlist.title,
            description: playlist.description,
            alternative_id: playlist.alternative_id,
            image: playlist.image,
            cover: playlist.cover,
            last_update: new Date
          }
        });
        
        let new_episodes_push$: Observable<any> = this.getCollection(COLLECTION_NAMES.playlist_items).pipe(
          switchMap(
            collection => from(collection.bulkInsert(playlist.episodes.filter(e => !e.uuid).map(e => ({...e,playlist_uuid: playlist.uuid}))))
          )
        );

        return concat(
            forkJoin([
              from(Promise.all(operations_on_episodes)),
              from(operation_on_playlist)
            ]),
            new_episodes_push$
          ).pipe(
          switchMap(
            () => this.getPlaylist(playlist.uuid)
          )
        )

      })
    )
  }

  public getPlaylist(uuid: string): Observable<RxDocument<Playlist<RxDocument<Episode>>>> {
    return forkJoin([
      this.getCollection<Playlist<RxDocument<Episode>>>(COLLECTION_NAMES.playlist_headers).pipe(
        switchMap(collection => collection.findOne().where('uuid').eq(uuid).exec())
      ),
      this.getCollection<Episode>(COLLECTION_NAMES.playlist_items).pipe(
        switchMap(collection => from(collection.find({
          selector: {
            playlist_uuid: {$eq: uuid}
          }
        }).exec()))
      )
    ]).pipe(
      map( ([header,episodes]) => {
        header.episodes = episodes.sort((a,b) => (a.number-b.number));
        return header;// as RxDocument<PlaylistHeader<RxDocument<PlaylistItem>>>;
      })
    )
  }



}

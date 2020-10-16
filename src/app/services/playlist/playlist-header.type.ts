import { RxJsonSchema, RxSchema } from 'rxdb';
import { Episode, WaifuEpisode } from './playlist-item.type';
import { Resource, RESOURCE_SCHEMA } from './resource.type';

export interface WaifuPlaylist {
  title: string;
  description?: string;
  alternative_id?: string;
  image?: string;
  cover?: string;
  episodes?: WaifuEpisode[];
}

export interface Playlist<T extends WaifuEpisode = Episode> extends WaifuPlaylist {
  uuid?: string;
  title: string;
  description?: string;
  hidden?: 0|1;
  alternative_id?: string;

  last_update?: Date;
  last_seen?: Date;
  last_seen_episode?: number;

  image?: string;
  cover?: string;
  episodes?: T[];
}

export const PLAYLIST_HEADER_SCHEMA: RxJsonSchema<Playlist> = {
  title: "playlist-headers",
  description: "playlist headers",
  version: 1,

  type: 'object',
  properties: { 
    uuid: {
      type: 'string',
      primary: true,
      final: true
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'string',
      default: '',
    },
    hidden: {
      type: 'integer',
      default: 0
    },
    alternative_id: {
      type: 'string'
    },
    last_update: {
      type: 'integer',
      default: 0,
    },
    last_seen: {
      type: 'integer',
      default: 0
    },
    last_seen_episode: {
      type: 'integer',
      default: 1
    },
    image: {
      type: 'string'
    },
    cover: {
      type: 'string'
    },
  },
  required: ['uuid', 'title', 'alternative_id'],
  indexes: ['title','alternative_id','last_seen','hidden'],
  attachments: {
    encrypted: false
  }
}
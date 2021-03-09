import { RxJsonSchema } from 'rxdb';
import { Resource } from './resource.type';

export interface WaifuEpisode {
  title: string;
  url: string;
}

export interface Episode extends WaifuEpisode{
  uuid?: number;
  title: string;
  number: number;
  url: string;
  playlist_uuid?: string;
  last_update?: Date;
  last_seen?: Date;
  time?: number;
  duration?: number;
  downloaded?:false;
}

export const PLAYLIST_ITEM_SCHEMA: RxJsonSchema<Episode> = {
  title: "playlist-headers",
  description: "playlist headers",
  version: 2,

  type: 'object',
  properties: { 
    uuid: {
      type: 'string',
      primary: true,
      final: true
    },
    playlist_uuid: {
      type: 'string',
      final: true
    },
    title: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    number: {
      type: 'integer',
      default: 1
    },
    last_update: {
      type: 'integer',
      default: 0,
    },
    last_seen: {
      type: 'integer',
      default: 0
    },
    time: {
      type: 'integer',
      default: 0
    },
    duration: {
      type: 'integer',
      default: 0
    },
    downloaded: {
      type: 'boolean',
      default: false
    }
  },
  required: ['uuid', 'playlist_uuid','number','url', 'last_seen',],
  indexes: ['uuid','playlist_uuid','number','last_seen'],

  attachments: {
    encrypted: false
  }
}
export const PLAYLIST_ITEM_SCHEMA_MIGRATION = {
  1 : elem => elem,
  2: (elem: Episode) => {
    elem.downloaded = false;
    elem.duration = 0;
    return elem;
  }
}
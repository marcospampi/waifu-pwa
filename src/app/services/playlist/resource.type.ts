import { TagContentType } from '@angular/compiler';

export interface Resource {
  kind: 'image'|'video';
  url?: string;
  data: File;
}

export const RESOURCE_SCHEMA = {
  type: 'object',
  properties: {
    kind: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    data: {
      type: 'File'
    }

  }
}
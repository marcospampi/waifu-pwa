import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
import * as idb_adapter from 'pouchdb-adapter-idb';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBWatchForChangesPlugin } from 'rxdb/plugins/watch-for-changes';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

import { addRxPlugin } from 'rxdb';

addRxPlugin(idb_adapter);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBValidatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBWatchForChangesPlugin);
addRxPlugin(RxDBUpdatePlugin);


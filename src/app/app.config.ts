import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideStore, StoreModule} from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {VIEW_FEATURE_KEY, viewReducer} from './+state/view/view.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {ViewEffects} from './+state/view/view.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideStore({
      [VIEW_FEATURE_KEY]: viewReducer,
    }),
    provideEffects(
      ViewEffects,
    ),
    provideStoreDevtools({ maxAge: 25, logOnly: true })
]
};

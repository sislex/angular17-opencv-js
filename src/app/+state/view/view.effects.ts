import { Injectable } from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {selectSideMenu, setSideMenu} from './view.actions';
import {getSideMenu} from './view.selectors';
import {Store} from '@ngrx/store';
import {IMenuItem} from './view.reducer';

@Injectable()
export class ViewEffects {

  sendMessage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(selectSideMenu),
        concatLatestFrom(() => this.store.select(getSideMenu)),
        tap(([{menuItem}, sideMenu]) => {
          const newSideMenu: IMenuItem[] = sideMenu.map(item => ({
            ...item,
            isSelected: item === menuItem,
          }));
          this.store.dispatch(setSideMenu({ sideMenu: newSideMenu }));
        })
      ),
    {
      dispatch: false,
    }
  );

  constructor(
    private readonly store: Store,
    private actions$: Actions,
  ) {}
}

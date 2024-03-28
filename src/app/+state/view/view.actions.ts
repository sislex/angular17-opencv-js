import {createAction, props} from '@ngrx/store';
import {IMenuItem} from './view.reducer';

export const selectSideMenu = createAction(
  '[View] selectSideMenu',
  props<{ menuItem: IMenuItem }>()
);

export const setSideMenu = createAction(
  '[View] setSideMenu',
  props<{ sideMenu: IMenuItem[] }>()
);

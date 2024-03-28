import {createFeatureSelector, createSelector} from '@ngrx/store';
import { IViewState, VIEW_FEATURE_KEY } from './view.reducer';

export const selectFeature = createFeatureSelector<IViewState>(VIEW_FEATURE_KEY);

export const getSideMenu = createSelector(
  selectFeature,
  (state: IViewState) => state.sideMenu
);

export const getSelectedSideMenuItem = createSelector(
  selectFeature,
  (state: IViewState) => state.sideMenu.find(item => item.isSelected)
);

export const isImageView = createSelector(
  selectFeature,
  (state: IViewState) => state.sideMenu.find(item => item.isSelected)?.name === 'Image'
);

export const isInternalCameraView = createSelector(
  selectFeature,
  (state: IViewState) => state.sideMenu.find(item => item.isSelected)?.name === 'Image from internal camera'
);

export const isExternalCameraView = createSelector(
  selectFeature,
  (state: IViewState) => state.sideMenu.find(item => item.isSelected)?.name === 'Image from external camera'
);

export const isVideoView = createSelector(
  selectFeature,
  (state: IViewState) => state.sideMenu.find(item => item.isSelected)?.name === 'Image from video'
);

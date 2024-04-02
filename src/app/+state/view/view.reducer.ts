import { createReducer, on } from '@ngrx/store';
import { setSideMenu } from './view.actions';

export const VIEW_FEATURE_KEY = 'view';

export interface IMenuItem {
  name: string;
  isSelected?: boolean;
  data?: any;
}

export interface IViewState {
  sideMenu: IMenuItem[];
}

export const initialViewState: IViewState = {
  sideMenu:  [
    {name: 'Image', isSelected: true, data: {src: 'assets/images/faces.jpeg', scaleRecognition: 4.5}},
    {name: 'Image from internal camera', data: {isVideo: true, isCamera: true, scaleRecognition: 2, recognitionInterval: 100}},
    {name: 'Image from external camera', data: {src: 'http://192.168.20.135:8080/video', scaleRecognition: 1, recognitionInterval: 100}},
    {name: 'Image from video', data: {src: 'assets/videos/people.mp4', isVideo: true, scaleRecognition: 2, recognitionInterval: 100}},
  ],
};

export const viewReducer = createReducer(
  initialViewState,
  on(setSideMenu, (state, {sideMenu}) => ({...state, sideMenu})),
);

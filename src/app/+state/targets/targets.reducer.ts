import { createReducer, on } from '@ngrx/store';
import {addCoordinatesData, setCoordinatesList} from './targets.actions';

export const TARGETS_FEATURE_KEY = 'targets';

export interface ICoordinatesItem {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface IViewState {
  numberOfCoordinates: number;
  currentCoordinatesNumber: number;
  overageRecognitionTime: number;
  coordinatesList: { [key: number]: ICoordinatesItem[] };
}

export const initialViewState: IViewState = {
  numberOfCoordinates: 100,
  currentCoordinatesNumber: 0,
  overageRecognitionTime: 0,
  coordinatesList:  {},
};

export const targetsReducer = createReducer(
  initialViewState,
  on(addCoordinatesData, (state, {data}) => ({
    ...state,
    coordinatesList: data.coordinatesList,
    currentCoordinatesNumber: data.currentCoordinatesNumber,
    overageRecognitionTime: data.overageRecognitionTime,
  })),
);

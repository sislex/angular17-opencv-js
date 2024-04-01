import { Injectable } from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {tap, withLatestFrom} from 'rxjs';
import {addCoordinates, addCoordinatesData} from './targets.actions';
import {Store} from '@ngrx/store';
import {
  getCurrentCoordinatesNumber,
  getNumberOfCoordinates, getOverageRecognitionTime,
  getCoordinatesList
} from './targets.selectors';
import {ICoordinatesItem} from './targets.reducer';

@Injectable()
export class TargetsEffects {

  sendMessage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(addCoordinates),
        concatLatestFrom(
          () =>[
            this.store.select(getCoordinatesList),
            this.store.select(getNumberOfCoordinates),
            this.store.select(getCurrentCoordinatesNumber),
            this.store.select(getOverageRecognitionTime),
          ],
        ),
        tap(([
          {recognitionData},
               coordinatesList ,
               numberOfCoordinates,
               currentCoordinatesNumber,
               overageRecognitionTime,
             ]) => {
          currentCoordinatesNumber = currentCoordinatesNumber + 1;

          const newCoordinatesList = {
            ...coordinatesList,
            [currentCoordinatesNumber]: recognitionData.coordinates,
          };
          if (newCoordinatesList[currentCoordinatesNumber - numberOfCoordinates]) {
            delete newCoordinatesList[currentCoordinatesNumber - numberOfCoordinates];
          }

          if (overageRecognitionTime === 0) {
            overageRecognitionTime = recognitionData.recognitionTime;
          }
          const newOverageRecognitionTime = Math.round((overageRecognitionTime + recognitionData.recognitionTime) / 2);


          const data = {
            coordinatesList: newCoordinatesList,
            currentCoordinatesNumber,
            overageRecognitionTime: newOverageRecognitionTime,
          };

          this.store.dispatch(addCoordinatesData({data}));
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

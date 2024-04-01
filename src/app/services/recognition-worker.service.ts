import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecognitionWorkerService {
  private workerUrl = '/assets/workers/openCv-face.js';

  private readonly events$ = new Subject<any>();
  private worker!: Worker;
  readonly isWorkerReady$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.events$.subscribe((message) => {

    });
  }

  getWorkerMessages(workerUrl = this.workerUrl) {
    if (!this.worker) {
      let worker!: Worker;
      if (typeof Worker !== 'undefined') {
        worker = new Worker(workerUrl);

        worker.onmessage = ({ data }) => {
          if (data.event === 'CLASSIFIER_LOADED') {
            this.isWorkerReady$.next(true);
          } else {
            this.events$.next(data);
          }
        };

        worker.onerror = (error) => {
          console.error(`Error Web Worker:`, error);
        };
      } else {
        console.error('Web Workers are not supported');
      }

      this.worker = worker;
    }

    return this.events$;
  }

  destroyWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.isWorkerReady$.next(false);
    }
  }

  sendMessage(data: any, transferList: any = null) {
    if (this.worker) {
      this.worker.postMessage(data, transferList);
    }
  }
}
